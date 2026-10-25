#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""publish.py 회귀 테스트 — 예약 시각과 YouTube 예약 게시 요청 본문.

업로드·네트워크를 쓰지 않습니다. YouTube 예약 게시(publishAt)는 실제 영상이 없어도
"무엇을 보내는지"를 검사할 수 있으므로, 요청 본문을 만드는 함수를 떼어 두고
여기서 고정합니다(규칙이 깨지면 업로드 전에 실패합니다).

실행:
  cd promo
  python -m unittest test_publish -v
"""

from __future__ import annotations

import argparse
import ast
import io
import json
import sys
import tempfile
import types
import unittest
from datetime import datetime, timedelta
from pathlib import Path
from unittest import mock

import publish

try:
    from PIL import Image
except ImportError:  # Pillow 는 requirements 필수지만, 없으면 그 테스트만 건너뜁니다.
    Image = None  # type: ignore[assignment]

PROMO = Path(__file__).resolve().parent
SOURCES = ("publish.py", "make_shorts.py", "make_tts_samples.py", "test_publish.py")


class PythonCompatibilityTest(unittest.TestCase):
    """README 는 Python 3.8 이상을 안내합니다 — 3.8 문법으로도 읽혀야 실행이 됩니다."""

    def test_sources_parse_with_python38_grammar(self):
        for name in SOURCES:
            source = (PROMO / name).read_text(encoding="utf-8")
            with self.subTest(source=name):
                ast.parse(source, filename=name, feature_version=(3, 8))

    def test_no_python39_only_path_helpers(self):
        # Path.is_relative_to 는 3.9 부터입니다 — 3.8 에서 AttributeError 가 납니다.
        for name in ("publish.py", "make_shorts.py"):
            source = (PROMO / name).read_text(encoding="utf-8")
            self.assertNotIn(".is_relative_to(", source, f"{name}: 3.9+ 전용 API 사용")

    def test_relative_display_handles_outside_paths(self):
        inside = PROMO / "assets" / "shorts" / "x.mp4"
        self.assertTrue(publish.relative_display(inside).endswith("x.mp4"))
        outside = Path(tempfile.gettempdir()) / "outside.mp4"
        self.assertEqual(publish.relative_display(outside), str(outside))


class ConfusablesBlankTest(unittest.TestCase):
    """혼동 어휘 빈칸 — 굴절형(complimented·devised)도 빈칸이 되어야 문항이 빠지지 않습니다."""

    def test_inflected_forms_are_blanked(self):
        cases = [("The manager complimented her on the presentation.", "compliment"),
                 ("The team devised a new marketing strategy.", "devise"),
                 ("The shipment is insured against damage.", "insure"),
                 ("Sales rose sharply in the first quarter.", "rise")]
        for sentence, word in cases:
            with self.subTest(word=word):
                blanked = publish._blank_word(sentence, word)
                self.assertIn(publish.BLANK, blanked)
                self.assertNotIn(word, blanked.lower().replace(publish.BLANK, ""))

    def test_unknown_word_still_returns_empty(self):
        self.assertEqual(publish._blank_word("Nothing here.", "compliment"), "")

    def test_every_confusable_pair_yields_two_rows(self):
        pairs = {str(d.get("pair", "")) for d in (publish.load_app_data_list("CONFUSABLES") or [])}
        rows = publish.load_kind_rows("confusables")
        self.assertEqual(len(rows), len(pairs) * 2, "쌍마다 양쪽 문항이 모두 만들어져야 합니다")


class KindRowKeyTest(unittest.TestCase):
    """새 포맷 중복 방지 키 — 표시용 term 이 겹쳐도 행마다 유일해야 합니다."""

    def test_keys_are_unique_for_every_kind(self):
        for kind in publish.KIND_LOADERS:
            rows = publish.load_kind_rows(kind)
            keys = [publish.normalize_word(publish.kind_row_key(r)) for r in rows]
            with self.subTest(kind=kind):
                self.assertEqual(len(keys), len(set(keys)), f"{kind} 중복 방지 키가 겹칩니다")

    def test_duplicate_section_titles_are_distinguished(self):
        # 전략 가이드에는 같은 절 제목("예문으로 확인하기")이 여러 가이드에 있습니다.
        rows = publish.load_kind_rows("strategy")
        same_title = [r for r in rows if r["term"] == "예문으로 확인하기"]
        self.assertGreater(len(same_title), 1, "검증할 중복 제목 절이 데이터에 있어야 합니다")
        self.assertEqual(len({publish.kind_row_key(r) for r in same_title}), len(same_title))


class ParsePublishAtTest(unittest.TestCase):
    """YouTube 예약 공개 시각 파싱 — 과거·너무 촉박한 시각을 먼저 막습니다."""

    def test_accepts_future_local_time(self):
        target = (datetime.now() + timedelta(days=1, minutes=5)).replace(microsecond=0)
        value = target.strftime("%Y-%m-%d %H:%M")
        parsed = publish.parse_publish_at(value)
        self.assertEqual(parsed.strftime("%Y-%m-%d %H:%M"), value)
        self.assertIsNotNone(parsed.tzinfo, "시간대가 붙지 않으면 API 가 거부합니다")

    def test_accepts_iso_with_offset(self):
        target = datetime.now().astimezone() + timedelta(days=2)
        iso = target.replace(microsecond=0).isoformat(timespec="seconds")
        parsed = publish.parse_publish_at(iso)
        self.assertEqual(parsed, target.replace(microsecond=0))

    def test_rejects_past_time(self):
        past = (datetime.now() - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M")
        with self.assertRaises(ValueError):
            publish.parse_publish_at(past)

    def test_rejects_time_too_soon(self):
        # YouTube 가 거부할 수 있는 이른 시각 — 최소 10분 여유를 둡니다.
        soon = (datetime.now() + timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M")
        with self.assertRaises(ValueError):
            publish.parse_publish_at(soon)

    def test_rejects_empty_and_bad_format(self):
        for value in ("", "   ", "내일 저녁", "2026-13-45 99:99"):
            with self.assertRaises(ValueError):
                publish.parse_publish_at(value)

    def test_publish_at_iso_is_rfc3339(self):
        target = (datetime.now().astimezone() + timedelta(days=1)).replace(microsecond=0)
        iso = publish.publish_at_iso(target)
        self.assertIn("T", iso)
        self.assertRegex(iso, r"T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$",
                         "초 단위(HH:MM:SS)와 시간대 오프셋이 있어야 합니다")


class MultiVideoPlanTest(unittest.TestCase):
    """여러 영상 예약 — 공개 시각 간격과 예약 방식 선택."""

    def test_publish_times_are_staggered_by_days(self):
        start = (datetime.now().astimezone() + timedelta(days=1)).replace(microsecond=0)
        times = publish.plan_publish_times(start, 3, 2)
        self.assertEqual(times, [publish.publish_at_iso(start + timedelta(days=2 * i))
                                 for i in range(3)])
        self.assertEqual(len(set(times)), 3, "영상마다 공개 시각이 달라야 합니다")

    def test_publish_times_empty_and_interval_floor(self):
        start = (datetime.now().astimezone() + timedelta(days=1)).replace(microsecond=0)
        self.assertEqual(publish.plan_publish_times(start, 0, 1), [])
        # 0·음수 간격은 1일로 올려 같은 시각에 몰리지 않게 합니다.
        self.assertEqual(publish.plan_publish_times(start, 2, 0),
                         publish.plan_publish_times(start, 2, 1))

    def test_auto_mode_prefers_native_for_youtube_only(self):
        self.assertEqual(publish.resolve_plan_mode(["yt"]), "native")
        self.assertEqual(publish.resolve_plan_mode(["yt"], "auto"), "native")

    def test_auto_mode_keeps_local_when_other_platforms_are_mixed(self):
        # Instagram·TikTok 은 예약 공개를 지원하지 않으므로 YouTube 예약 게시로 바꾸면 안 됩니다.
        self.assertEqual(publish.resolve_plan_mode(["yt", "ig"]), "local")
        self.assertEqual(publish.resolve_plan_mode(["ig"]), "local")

    def test_explicit_mode_wins_and_unknown_falls_back_to_auto(self):
        self.assertEqual(publish.resolve_plan_mode(["yt", "ig"], "native"), "native")
        self.assertEqual(publish.resolve_plan_mode(["yt"], "local"), "local")
        self.assertEqual(publish.resolve_plan_mode(["yt"], "bogus"), "native")


class AutoPlanNativeTest(unittest.TestCase):
    """--auto-plan native — 영상마다 간격을 둔 publish_at 으로 즉시 업로드합니다."""

    def test_native_plan_uploads_each_video_with_staggered_publish_at(self):
        start = (datetime.now().astimezone() + timedelta(days=1)).replace(second=0, microsecond=0)
        videos = [Path("a.mp4"), Path("b.mp4"), Path("c.mp4")]
        calls = []
        cfg = {"promo": {"default_words": 1}, "youtube": {"enabled": True}}
        with mock.patch.object(publish, "build_shorts_command", return_value=["make"]), \
                mock.patch.object(publish, "run_menu_command", return_value=True), \
                mock.patch.object(publish, "newest_video_since", side_effect=videos), \
                mock.patch.object(publish, "publish_single",
                                  side_effect=lambda _cfg, args, _video: calls.append(args)):
            publish.run_auto_plan(cfg, 3, "unit", start_at=start.strftime("%Y-%m-%d %H:%M"),
                                  interval_days=2, platforms="yt", mode="native")
        self.assertEqual(len(calls), 3)
        self.assertEqual([c.publish_at for c in calls],
                         publish.plan_publish_times(start, 3, 2))
        self.assertTrue(all(c.platforms == "yt" for c in calls),
                        "YouTube 예약 게시는 yt 만 대상으로 해야 합니다")
        self.assertTrue(all(c.dry_run is False for c in calls))

    def test_native_plan_refuses_mixed_platforms(self):
        cfg = {"promo": {"default_words": 1}}
        with mock.patch.object(publish, "build_shorts_command", return_value=["make"]), \
                mock.patch.object(publish, "run_menu_command", return_value=True), \
                mock.patch.object(publish, "newest_video_since", return_value=Path("a.mp4")), \
                mock.patch.object(publish, "publish_single") as upload:
            publish.run_auto_plan(cfg, 1, "unit", start_at="2026-11-01 19:00",
                                  platforms="yt,ig", mode="native")
        upload.assert_not_called()


class ScheduleParseZTest(unittest.TestCase):
    """ISO 끝의 Z(UTC) — Python 3.11 이전에서도 읽히도록 직접 처리합니다."""

    def test_trailing_z_is_accepted(self):
        parsed = publish.parse_schedule_time("2026-11-01T10:00:00Z")
        self.assertEqual(parsed.astimezone(publish.timezone.utc).hour, 10)


class ReportHtmlTest(unittest.TestCase):
    """게시 이력 리포트 — 링크 칸을 f-string 밖에서 만들어 3.8 에서도 실행돼야 합니다."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self._old = (publish.HISTORY_FILE, publish.REPORT_DIR, publish.PERF_FILE)
        publish.HISTORY_FILE = Path(self.tmp.name) / "history.csv"
        publish.REPORT_DIR = Path(self.tmp.name) / "reports"
        publish.PERF_FILE = Path(self.tmp.name) / "performance.json"

    def tearDown(self):
        publish.HISTORY_FILE, publish.REPORT_DIR, publish.PERF_FILE = self._old
        self.tmp.cleanup()

    def test_report_escapes_html_and_renders_links(self):
        publish.append_history(event="publish", status="success", platform="yt",
                               video="v.mp4", title="<script>alert(1)</script>",
                               url="https://youtu.be/abc")
        publish.append_history(event="publish", status="failed", platform="yt",
                               video="v.mp4", title="no link", url="")
        out = publish.write_history_report(open_after=False)
        self.assertIsNotNone(out)
        html = out.read_text(encoding="utf-8")
        self.assertIn('href="https://youtu.be/abc"', html)
        self.assertNotIn("<script>", html, "제목의 HTML 은 이스케이프되어야 합니다")
        self.assertIn("&lt;script&gt;", html)

    def test_link_cell_without_url_is_empty(self):
        self.assertEqual(publish.link_cell(""), "")


class VideoMenuSelectionTest(unittest.TestCase):
    """영상 번호 선택 — 0 이나 범위 밖 번호가 마지막 영상을 조용히 고르면 안 됩니다."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.videos = []
        for name in ("a.mp4", "b.mp4"):
            path = Path(self.tmp.name) / name
            path.write_bytes(b"x" * 8)
            self.videos.append(path)

    def tearDown(self):
        self.tmp.cleanup()

    def test_zero_and_out_of_range_are_rejected(self):
        # 0 → (예전에는 마지막 영상), 9 → 범위 밖, 그 다음 1 → 첫 영상.
        with mock.patch.object(publish, "list_videos_menu", return_value=self.videos), \
                mock.patch.object(publish, "ask_menu", side_effect=["0", "9", "1"]):
            self.assertEqual(publish.choose_video_menu(), self.videos[0])


class LocalScheduleTimeTest(unittest.TestCase):
    """기존 로컬 예약과 같은 파서를 쓰므로, 두 방식의 시간 해석이 같아야 합니다."""

    def test_naive_time_gets_local_timezone(self):
        parsed = publish.parse_schedule_time("2026-11-01 19:00")
        self.assertIsNotNone(parsed.tzinfo)
        self.assertEqual(parsed.strftime("%Y-%m-%d %H:%M"), "2026-11-01 19:00")

    def test_bad_format_message(self):
        with self.assertRaises(ValueError) as ctx:
            publish.parse_schedule_time("11/01/2026")
        self.assertIn("YYYY-MM-DD HH:MM", str(ctx.exception))


class DueSchedulesTest(unittest.TestCase):
    """도래한 예약 선택 — 깨진 항목이 있어도 전체 실행이 멈추지 않아야 합니다."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self._old_file = publish.SCHEDULE_FILE
        publish.SCHEDULE_FILE = Path(self.tmp.name) / "scheduled_posts.json"

    def tearDown(self):
        publish.SCHEDULE_FILE = self._old_file
        self.tmp.cleanup()

    def write(self, items):
        publish.SCHEDULE_FILE.write_text(json.dumps(items, ensure_ascii=False), encoding="utf-8")

    @staticmethod
    def item(scheduled_at, status="scheduled", **extra):
        return {"id": "t1", "scheduled_at": scheduled_at, "status": status,
                "video": "assets/shorts/x.mp4", "platforms": "yt", **extra}

    def test_past_is_due_and_future_is_not(self):
        past = (datetime.now().astimezone() - timedelta(hours=1)).isoformat(timespec="seconds")
        future = (datetime.now().astimezone() + timedelta(days=1)).isoformat(timespec="seconds")
        self.write([self.item(past), self.item(future), self.item(past, status="completed")])
        due = publish.due_schedules()
        self.assertEqual(len(due), 1, "도래한 scheduled 항목만 골라야 합니다")
        self.assertEqual(due[0]["scheduled_at"], past)

    def test_broken_time_is_skipped_not_fatal(self):
        past = (datetime.now().astimezone() - timedelta(hours=1)).isoformat(timespec="seconds")
        self.write([self.item("내일 저녁"), self.item(""), self.item(past)])
        due = publish.due_schedules()
        self.assertEqual(len(due), 1, "읽지 못한 항목만 건너뛰고 나머지는 실행합니다")

    def test_items_argument_keeps_identity_for_status_update(self):
        past = (datetime.now().astimezone() - timedelta(hours=1)).isoformat(timespec="seconds")
        items = [self.item(past)]
        due = publish.due_schedules(items)
        self.assertIs(due[0], items[0], "호출자가 상태를 저장할 수 있게 같은 객체를 돌려줍니다")


class NativeScheduleLedgerTest(unittest.TestCase):
    """YouTube 예약 게시 장부 — 현황 표시와 공개 여부 확인."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self._old = (publish.SCHEDULE_FILE, publish.NATIVE_SCHEDULE_FILE, publish.HISTORY_FILE)
        publish.SCHEDULE_FILE = Path(self.tmp.name) / "scheduled_posts.json"
        publish.NATIVE_SCHEDULE_FILE = Path(self.tmp.name) / "native_schedules.json"
        publish.HISTORY_FILE = Path(self.tmp.name) / "history.csv"

    def tearDown(self):
        publish.SCHEDULE_FILE, publish.NATIVE_SCHEDULE_FILE, publish.HISTORY_FILE = self._old
        self.tmp.cleanup()

    @staticmethod
    def iso(hours: float) -> str:
        return (datetime.now().astimezone() + timedelta(hours=hours)).isoformat(timespec="seconds")

    def test_record_same_video_is_updated_not_duplicated(self):
        publish.record_native_schedule(video_id="abc", video="v.mp4", title="t",
                                       publish_at=self.iso(5))
        publish.record_native_schedule(video_id="abc", video="v.mp4", title="t2",
                                       publish_at=self.iso(6))
        items = publish.load_native_schedules()
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["title"], "t2")
        self.assertEqual(items[0]["status"], "scheduled")

    def test_overview_returns_past_native_items(self):
        publish.record_native_schedule(video_id="past", video="a.mp4", title="지난 것",
                                       publish_at=self.iso(-1))
        publish.record_native_schedule(video_id="future", video="b.mp4", title="앞으로",
                                       publish_at=self.iso(24))
        due = publish.display_schedule_overview()
        self.assertEqual([i["video_id"] for i in due], ["past"])

    def test_verify_marks_published(self):
        publish.record_native_schedule(video_id="pub", video="a.mp4", title="t",
                                       publish_at=self.iso(-1))
        changed = publish.verify_native_schedules(
            {}, fetcher=lambda _cfg, ids: {v: {"privacy": "public"} for v in ids})
        self.assertEqual(changed, 1)
        self.assertEqual(publish.load_native_schedules()[0]["status"], "published")
        self.assertIn("published", publish.HISTORY_FILE.read_text(encoding="utf-8-sig"))

    def test_verify_marks_missing_when_video_gone(self):
        publish.record_native_schedule(video_id="gone", video="a.mp4", title="t",
                                       publish_at=self.iso(-1))
        publish.verify_native_schedules({}, fetcher=lambda _cfg, _ids: {})
        self.assertEqual(publish.load_native_schedules()[0]["status"], "missing")

    def test_verify_keeps_scheduled_before_publish_time(self):
        publish.record_native_schedule(video_id="soon", video="a.mp4", title="t",
                                       publish_at=self.iso(3))
        publish.verify_native_schedules(
            {}, fetcher=lambda _cfg, ids: {v: {"privacy": "private", "publish_at": "x"} for v in ids})
        self.assertEqual(publish.load_native_schedules()[0]["status"], "scheduled")

    def test_verify_tolerates_recent_private_after_publish_time(self):
        publish.record_native_schedule(video_id="lag", video="a.mp4", title="t",
                                       publish_at=self.iso(-0.05))  # 3분 전 — 유예 시간 안
        publish.verify_native_schedules({}, fetcher=lambda _cfg, ids: {v: {"privacy": "private"} for v in ids})
        self.assertEqual(publish.load_native_schedules()[0]["status"], "scheduled")

    def test_verify_does_not_touch_ledger_when_fetch_fails(self):
        publish.record_native_schedule(video_id="x", video="a.mp4", title="t",
                                       publish_at=self.iso(-1))
        self.assertEqual(publish.verify_native_schedules({}, fetcher=lambda _cfg, _ids: None), 0)
        item = publish.load_native_schedules()[0]
        self.assertEqual(item["status"], "scheduled")
        self.assertEqual(item.get("checked_at", ""), "")

    def test_verify_key_mode_does_not_mark_missing(self):
        # API 키만 있을 때 비공개(예약 대기) 영상은 조회되지 않습니다 — 삭제로 단정하면 안 됩니다.
        publish.record_native_schedule(video_id="hidden", video="a.mp4", title="t",
                                       publish_at=self.iso(3))
        changed = publish.verify_native_schedules(
            {}, fetcher=lambda _cfg, _ids: ({}, False))
        self.assertEqual(changed, 0)
        self.assertEqual(publish.load_native_schedules()[0]["status"], "scheduled")

    def test_cancel_without_full_token_keeps_ledger(self):
        item = publish.record_native_schedule(video_id="keep", video="a.mp4", title="t",
                                              publish_at=self.iso(3))
        self.assertFalse(publish.cancel_native_schedule(item["id"], {}))
        self.assertEqual(publish.load_native_schedules()[0]["status"], "scheduled")

    def test_cancel_unknown_id_is_safe(self):
        publish.record_native_schedule(video_id="keep", video="a.mp4", title="t",
                                       publish_at=self.iso(3))
        self.assertFalse(publish.cancel_native_schedule("nope", {}))
        self.assertEqual(len(publish.load_native_schedules()), 1)

    def test_verify_dry_run_does_not_save(self):
        publish.record_native_schedule(video_id="pub", video="a.mp4", title="t",
                                       publish_at=self.iso(-1))
        publish.verify_native_schedules(
            {}, dry_run=True, fetcher=lambda _cfg, ids: {v: {"privacy": "public"} for v in ids})
        self.assertEqual(publish.load_native_schedules()[0]["status"], "scheduled")


class YouTubeBodyTest(unittest.TestCase):
    """videos.insert 본문 — 예약 게시일 때만 private + publishAt 이 붙습니다."""

    META = {
        "title": "TOEIC 필수 어휘 | toeic.monster",
        "desc": "발음·예문으로 외우는 TOEIC 보카",
        "hashtags": "#toeic #토익",
    }
    YT = {"tags": ["TOEIC", "영어단어"], "category_id": "27"}

    def test_normal_upload_keeps_privacy(self):
        body = publish.build_youtube_body(self.META, self.YT, "unlisted")
        self.assertEqual(body["status"]["privacyStatus"], "unlisted")
        self.assertNotIn("publishAt", body["status"])
        self.assertIs(body["status"]["selfDeclaredMadeForKids"], False)

    def test_scheduled_upload_is_private_until_publish_at(self):
        when = "2026-11-01T19:00:00+09:00"
        body = publish.build_youtube_body(self.META, self.YT, "public", when)
        self.assertEqual(body["status"]["privacyStatus"], "private")
        self.assertEqual(body["status"]["publishAt"], when)

    def test_description_and_tags_combine(self):
        body = publish.build_youtube_body(self.META, self.YT, "public")
        self.assertEqual(body["snippet"]["description"],
                         "발음·예문으로 외우는 TOEIC 보카\n\n#toeic #토익")
        self.assertEqual(body["snippet"]["tags"], ["TOEIC", "영어단어", "toeic", "토익"])

    def test_empty_description_uses_hashtags_only(self):
        meta = dict(self.META, desc="")
        body = publish.build_youtube_body(meta, self.YT, "public")
        self.assertEqual(body["snippet"]["description"], "#toeic #토익")

    def test_tags_are_capped_at_youtube_limit(self):
        yt = {"tags": [f"tag{i}" for i in range(600)], "category_id": "27"}
        body = publish.build_youtube_body(self.META, yt, "public")
        self.assertEqual(len(body["snippet"]["tags"]), 500)

    def test_category_and_language_are_set(self):
        body = publish.build_youtube_body(self.META, self.YT, "public")
        self.assertEqual(body["snippet"]["categoryId"], "27")
        self.assertEqual(body["snippet"]["defaultLanguage"], "ko")


class MenuAndDocsTest(unittest.TestCase):
    """메뉴 번호·문서가 실제 기능과 어긋나지 않게 고정합니다."""

    def test_menu_numbers_are_sequential(self):
        numbers = [int(num) for num, _title, _alias in publish.MENU_ITEMS]
        self.assertEqual(numbers, list(range(1, len(numbers) + 1)))

    def test_menu_groups_cover_every_menu_once(self):
        grouped = [num for _group, nums in publish.MENU_GROUPS for num in nums]
        self.assertEqual(sorted(grouped), sorted(num for num, _t, _a in publish.MENU_ITEMS))
        self.assertEqual(len(grouped), len(set(grouped)), "같은 메뉴가 두 그룹에 들어 있습니다")

    def test_every_menu_has_description(self):
        for num, _title, _alias in publish.MENU_ITEMS:
            self.assertIn(num, publish.MENU_DESC, f"메뉴 {num} 설명이 없습니다")

    def test_readme_documents_publish_at(self):
        readme = (PROMO / "README.md").read_text(encoding="utf-8")
        self.assertIn("--publish-at", readme)
        self.assertIn("YouTube 예약 게시", readme)

    def test_bat_help_documents_publish_at(self):
        bat = (PROMO / "promo_center.bat").read_text(encoding="utf-8")
        self.assertIn("--publish-at", bat)

    def test_docs_document_multi_video_native_scheduling(self):
        readme = (PROMO / "README.md").read_text(encoding="utf-8")
        bat = (PROMO / "promo_center.bat").read_text(encoding="utf-8")
        for text in ("--plan-mode", "--batch", "--publish-at"):
            self.assertIn(text, readme)
            self.assertIn(text, bat)

    def test_readme_documents_schedule_overview(self):
        readme = (PROMO / "README.md").read_text(encoding="utf-8")
        self.assertIn("--schedules", readme)
        self.assertIn("--verify-schedules", readme)


class DefaultVoiceTest(unittest.TestCase):
    """기본 목소리는 필요할 때만 계산해야 하고(불러오기 속도), 옛 이름 접근도 계속 동작해야 합니다."""

    def test_default_voice_is_lazy(self):
        """`import publish` 만으로는 Windows 음성 목록을 읽지 않아야 합니다."""
        source = (PROMO / "publish.py").read_text(encoding="utf-8")
        tree = ast.parse(source)
        module_level_calls = [
            node for node in tree.body
            if isinstance(node, ast.Assign)
            and isinstance(node.value, ast.Call)
            and any(token in ast.unparse(node.value.func) for token in ("default_voice", "_pick_default_voice"))
        ]
        self.assertEqual(module_level_calls, [], "기본 목소리를 모듈 수준에서 계산하면 실행마다 PowerShell 이 돕니다")

    def test_default_voice_functions_return_strings(self):
        for func in (publish.default_voice, publish.default_voice2):
            value = func()
            self.assertIsInstance(value, str)
            self.assertTrue(value.strip(), f"{func.__name__} 가 빈 문자열을 돌려줬습니다")

    def test_legacy_attribute_names_still_work(self):
        for name in ("DEFAULT_VOICE", "DEFAULT_VOICE2"):
            self.assertIsInstance(getattr(publish, name), str)

    def test_unknown_attribute_raises(self):
        with self.assertRaises(AttributeError):
            publish.NOT_A_REAL_SETTING  # noqa: B018


class MenuInputParseTest(unittest.TestCase):
    """메뉴 입력 해석 — 번호·범위·키워드·종료가 정확한 실행 목록으로 바뀌어야 합니다."""

    def parse(self, raw: str, default: str = "11"):
        return publish.parse_menu_input(raw, default)

    def test_plain_number_and_empty_uses_default(self):
        self.assertEqual(self.parse("5")[0], ["5"])
        self.assertEqual(self.parse("")[0], ["11"])
        self.assertEqual(self.parse("   ")[0], ["11"])

    def test_comma_list_keeps_order_and_dedupes(self):
        self.assertEqual(self.parse("15,16")[0], ["15", "16"])
        self.assertEqual(self.parse("5,5")[0], ["5"])

    def test_ranges_are_inclusive_and_normalized(self):
        self.assertEqual(self.parse("1-4")[0], ["1", "2", "3", "4"])
        self.assertEqual(self.parse("4~1")[0], ["1", "2", "3", "4"])

    def test_quit_and_help_words(self):
        self.assertEqual(self.parse("q"), ([], True, False))
        self.assertEqual(self.parse("종료"), ([], True, False))
        self.assertEqual(self.parse("?"), ([], False, True))

    def test_keyword_resolves_to_single_menu(self):
        hits = publish.search_menu("piper")
        self.assertEqual(len(hits), 1, "고유 키워드는 바로 실행되어야 합니다")
        self.assertEqual(self.parse("piper")[0], hits)

    def test_unknown_number_is_refused_not_clamped(self):
        # 이웃 번호를 조용히 실행하면 엉뚱한 메뉴(게시 등)가 돌아갑니다.
        self.assertEqual(self.parse("99")[0], [])

    def test_too_many_steps_are_refused(self):
        too_many = ",".join(str(n) for n in range(1, publish.MAX_MENU_STEPS + 2))
        self.assertEqual(self.parse(too_many)[0], [])

    def test_search_results_are_valid_menu_numbers(self):
        for query in ("예약", "숙어", "tts", "설정"):
            hits = publish.search_menu(query)
            with self.subTest(query=query):
                self.assertTrue(hits)
                self.assertTrue(set(hits) <= set(publish.MENU_TITLES))

    def test_nearest_menu_number_never_invents_a_menu(self):
        for token in ("99", "0", "-3", "abc"):
            near = publish.nearest_menu_number(token)
            with self.subTest(token=token):
                self.assertTrue(near == "" or near in publish.MENU_TITLES)


class MenuHistoryAndFavoritesTest(unittest.TestCase):
    """최근 사용·즐겨찾기 메뉴 — config 에 저장되고 잘못된 번호는 걸러집니다."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self._old = publish.CONFIG_FILE
        publish.CONFIG_FILE = Path(self.tmp.name) / "config.json"
        self.cfg: dict = {"promo": {}}

    def tearDown(self):
        publish.CONFIG_FILE = self._old
        self.tmp.cleanup()

    def test_recent_menus_are_deduped_and_capped(self):
        for num in ("1", "2", "3", "4", "5", "6", "2"):
            publish.record_recent_menu(self.cfg, num)
        recent = publish.recent_menus(self.cfg)
        self.assertEqual(recent[0], "2", "다시 실행한 메뉴가 맨 앞으로 와야 합니다")
        self.assertEqual(len(recent), publish.MAX_RECENT_MENUS)
        self.assertEqual(len(set(recent)), len(recent))

    def test_unknown_menu_is_not_recorded(self):
        publish.record_recent_menu(self.cfg, "99")
        self.assertEqual(publish.recent_menus(self.cfg), [])
        self.assertFalse(publish.CONFIG_FILE.exists(), "바뀐 것이 없으면 파일을 쓰지 않습니다")

    def test_record_recent_menu_saves_config(self):
        publish.record_recent_menu(self.cfg, "5")
        saved = json.loads(publish.CONFIG_FILE.read_text(encoding="utf-8"))
        self.assertEqual(saved["promo"]["recent_menus"], ["5"])

    def test_favorite_toggle_adds_then_removes(self):
        publish.toggle_favorite_menu(self.cfg, "11")
        self.assertEqual(publish.favorite_menus(self.cfg), ["11"])
        publish.toggle_favorite_menu(self.cfg, "11")
        self.assertEqual(publish.favorite_menus(self.cfg), [])

    def test_favorites_filter_invalid_numbers(self):
        self.cfg["promo"]["favorite_menus"] = ["11", "99", 12]
        self.assertEqual(publish.favorite_menus(self.cfg), ["11", "12"])


class HistoryLimitTest(unittest.TestCase):
    """이력 건수 설정 — 잘못된 값도 1~100 사이로 안전하게 맞춥니다."""

    def test_default_and_clamp(self):
        self.assertEqual(publish.history_limit_of({}), 10)
        self.assertEqual(publish.history_limit_of({"promo": {"history_limit": 5}}), 5)
        self.assertEqual(publish.history_limit_of({"promo": {"history_limit": 0}}), 1)
        self.assertEqual(publish.history_limit_of({"promo": {"history_limit": "999"}}), 100)
        self.assertEqual(publish.history_limit_of({"promo": {"history_limit": "abc"}}), 10)


class PublishPathTest(unittest.TestCase):
    """게시 경로 — 중복 방지·dry-run·수동 폴백이 실제 업로드 없이 검증되어야 합니다."""

    META = {"title": "t", "desc": "d", "hashtags": "#toeic", "word": "access",
            "word_bucket": 1, "unit": 1}

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.video = self.root / "v.mp4"
        self.video.write_bytes(b"x" * 16)
        self._old = (publish.HISTORY_FILE, publish.POSTED_FILE, publish.PROMO)
        publish.HISTORY_FILE = self.root / "history.csv"
        publish.POSTED_FILE = self.root / "posted.json"
        publish.PROMO = self.root

    def tearDown(self):
        publish.HISTORY_FILE, publish.POSTED_FILE, publish.PROMO = self._old
        self.tmp.cleanup()

    def args(self, **kw) -> argparse.Namespace:
        base = dict(video=str(self.video), unit=1, title=None, desc=None, platforms="yt",
                    dry_run=True, youtube_privacy=None, publish_at=None, allow_repeat=False,
                    manual_fallback=None, idioms=False, frequency=False, paraphrase=False,
                    kind="")
        base.update(kw)
        return argparse.Namespace(**base)

    def test_resolve_platforms_explicit_and_auto(self):
        cfg = {"youtube": {"enabled": True}, "instagram": {"enabled": False},
               "tiktok": {"enabled": False}}
        self.assertEqual(publish.resolve_platforms(cfg, "auto"), ["yt"])
        self.assertEqual(publish.resolve_platforms(cfg, None), ["yt"])
        self.assertEqual(publish.resolve_platforms(cfg, " IG , tt "), ["ig", "tt"])

    def test_dry_run_writes_history_without_marking(self):
        with mock.patch.object(publish, "build_meta", return_value=dict(self.META)), \
                mock.patch.object(publish, "upload_youtube", return_value="dry-run") as upload, \
                mock.patch.object(publish, "print_remaining"), \
                mock.patch.object(publish, "mark_words_posted") as mark_words, \
                mock.patch.object(publish, "mark_video_posted") as mark_video:
            publish.publish_single({"youtube": {"enabled": True}}, self.args(), self.video)
        upload.assert_called_once()
        mark_words.assert_not_called()
        mark_video.assert_not_called()
        rows = publish.read_history_rows()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["status"], "dry-run")
        self.assertEqual(rows[0]["platform"], "yt")

    def test_already_posted_platform_is_skipped(self):
        with mock.patch.object(publish, "build_meta", return_value=dict(self.META)), \
                mock.patch.object(publish, "filter_posted_platforms", return_value=([], ["yt"])), \
                mock.patch.object(publish, "upload_youtube") as upload:
            publish.publish_single({"youtube": {"enabled": True}},
                                   self.args(dry_run=False), self.video)
        upload.assert_not_called()
        self.assertEqual(publish.read_history_rows(), [])

    def test_failed_upload_falls_back_to_manual_helper(self):
        with mock.patch.object(publish, "build_meta", return_value=dict(self.META)), \
                mock.patch.object(publish, "upload_youtube", return_value=None), \
                mock.patch.object(publish, "filter_posted_platforms", return_value=(["yt"], [])), \
                mock.patch.object(publish, "manual_publish", return_value=True) as manual, \
                mock.patch.object(publish, "print_remaining"):
            publish.publish_single({"youtube": {"enabled": True}, "promo": {"manual_fallback": True}},
                                   self.args(dry_run=False), self.video)
        manual.assert_called_once()
        self.assertEqual(publish.read_history_rows()[0]["status"], "failed")

    def test_scheduled_upload_does_not_open_a_browser(self):
        # 예약 게시는 업로드가 끝난 뒤라 수동 폴백으로 브라우저를 열면 오해를 부릅니다.
        with mock.patch.object(publish, "build_meta", return_value=dict(self.META)), \
                mock.patch.object(publish, "upload_youtube", return_value=None), \
                mock.patch.object(publish, "filter_posted_platforms", return_value=(["yt"], [])), \
                mock.patch.object(publish, "manual_publish") as manual, \
                mock.patch.object(publish, "print_remaining"):
            publish.publish_single({"youtube": {"enabled": True}, "promo": {"manual_fallback": True}},
                                   self.args(dry_run=False, publish_at="2026-11-01T19:00:00+09:00"),
                                   self.video)
        manual.assert_not_called()

    def test_no_enabled_platform_exits(self):
        cfg = {"youtube": {"enabled": False}, "instagram": {"enabled": False},
               "tiktok": {"enabled": False}}
        with mock.patch.object(publish, "build_meta", return_value=dict(self.META)):
            with self.assertRaises(SystemExit):
                publish.publish_single(cfg, self.args(platforms="auto"), self.video)

    def test_scheduled_item_missing_video_records_failure(self):
        item = {"id": "s1", "video": "assets/shorts/none.mp4", "platforms": "yt"}
        self.assertFalse(publish.run_scheduled_item(item, {}))
        row = publish.read_history_rows()[0]
        self.assertEqual(row["status"], "failed")
        self.assertIn("찾을 수 없습니다", row["message"])

    def test_scheduled_item_skips_already_posted(self):
        item = {"id": "s2", "video": str(self.video), "platforms": "yt"}
        with mock.patch.object(publish, "build_meta", return_value=dict(self.META)), \
                mock.patch.object(publish, "filter_posted_platforms", return_value=([], ["yt"])), \
                mock.patch.object(publish, "upload_youtube") as upload:
            self.assertTrue(publish.run_scheduled_item(item, {}))
        upload.assert_not_called()
        self.assertEqual(publish.read_history_rows()[0]["status"], "skipped")

    def test_video_fingerprint_makes_duplicate_detection_content_based(self):
        copy = self.root / "copy.mp4"
        copy.write_bytes(self.video.read_bytes())
        publish.mark_video_posted(self.video, "yt", "https://youtu.be/x")
        remaining, skipped = publish.filter_posted_platforms(copy, ["yt", "ig"])
        self.assertEqual(remaining, ["ig"], "같은 내용의 다른 파일명도 이미 게시한 것으로 봅니다")
        self.assertEqual(skipped, ["yt"])


class FrameRenderTest(unittest.TestCase):
    """프레임 생성 — 병렬 렌더링을 켜도 예전 순차 렌더링과 같은 영상이 나와야 합니다."""

    def setUp(self):
        if Image is None:
            self.skipTest("Pillow 가 없어 프레임 테스트를 건너뜁니다")
        import make_shorts
        self.shorts = make_shorts

    def slide(self, color=(30, 40, 60)):
        return Image.new("RGB", (self.shorts.W, self.shorts.H), color)

    def test_frames_match_sequential_reference(self):
        shorts = self.shorts
        slide = self.slide()
        n = 20
        with tempfile.TemporaryDirectory() as td:
            paths = [Path(td) / f"f{i}.jpg" for i in range(n)]
            shorts.render_slide_frames(slide, paths, None)
            for i, path in enumerate(paths):
                t = i / (n - 1)
                expected = shorts.crop_zoom(slide, 1.0 + shorts.ZOOM * t)
                buf = io.BytesIO()
                expected.save(buf, format="JPEG", quality=92)
                with self.subTest(frame=i):
                    self.assertEqual(path.read_bytes(), buf.getvalue())

    def test_first_fade_frame_blends_with_previous_slide(self):
        shorts = self.shorts
        first, second = self.slide((20, 40, 70)), self.slide((70, 20, 40))
        with tempfile.TemporaryDirectory() as td:
            td = Path(td)
            head = [td / f"a{i}.jpg" for i in range(8)]
            prev_last = shorts.render_slide_frames(first, head, None)
            tail = [td / f"b{i}.jpg" for i in range(8)]
            shorts.render_slide_frames(second, tail, prev_last)
            expected = Image.blend(prev_last, shorts.crop_zoom(second, 1.0), 1 / shorts.FADE_FRAMES)
            buf = io.BytesIO()
            expected.save(buf, format="JPEG", quality=92)
            self.assertEqual(tail[1].read_bytes(), buf.getvalue())

    def test_workers_are_bounded_and_positive(self):
        self.assertGreaterEqual(self.shorts.FRAME_WORKERS, 1)
        self.assertLessEqual(self.shorts.FRAME_WORKERS, 8)


class PiperModelCacheTest(unittest.TestCase):
    """두 목소리를 번갈아 써도 모델을 다시 읽지 않아야 합니다(예전엔 슬라이드마다 재로딩, 실측 37초)."""

    def setUp(self):
        import make_shorts
        self.shorts = make_shorts
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.voices = {name: self.root / f"{name}.onnx" for name in ("en_US-amy-low", "en_US-ryan-high")}
        for path in self.voices.values():
            path.write_bytes(b"onnx")

    def tearDown(self):
        self.tmp.cleanup()

    def fake_module(self, loads):
        class FakeVoice:
            @classmethod
            def load(cls, path):
                loads.append(path)
                return cls()

            def synthesize_wav(self, _text, wf):
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(22050)
                wf.writeframes(b"\x00\x00" * 800)

        module = types.ModuleType("piper")
        module.PiperVoice = FakeVoice
        return module

    def test_two_voices_load_each_model_once(self):
        loads: list[str] = []
        with mock.patch.dict(sys.modules, {"piper": self.fake_module(loads)}), \
                mock.patch.object(self.shorts, "piper_voice_path", side_effect=self.voices.get), \
                mock.patch.object(self.shorts, "_PIPER_SESSIONS", {}):
            for i, voice in enumerate(("en_US-amy-low", "en_US-ryan-high") * 3):
                self.shorts._synthesize_piper("hello", voice, self.root / f"a{i}.wav")
        self.assertEqual(len(loads), 2, f"모델을 {len(loads)}번 읽었습니다 — 두 목소리는 두 번이면 됩니다")

    def test_cache_evicts_oldest_beyond_limit(self):
        loads: list[str] = []
        third = self.root / "en_US-third.onnx"
        third.write_bytes(b"onnx")
        paths = dict(self.voices, **{"en_US-third": third})
        with mock.patch.dict(sys.modules, {"piper": self.fake_module(loads)}), \
                mock.patch.object(self.shorts, "piper_voice_path", side_effect=paths.get), \
                mock.patch.object(self.shorts, "_PIPER_SESSIONS", {}) as cache:
            for voice in ("en_US-amy-low", "en_US-ryan-high", "en_US-third"):
                self.shorts._synthesize_piper("hi", voice, self.root / f"{voice}.wav")
            self.assertLessEqual(len(cache), self.shorts.PIPER_MODEL_CACHE)


if __name__ == "__main__":
    unittest.main(verbosity=2)
