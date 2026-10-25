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

import json
import tempfile
import unittest
from datetime import datetime, timedelta
from pathlib import Path

import publish

PROMO = Path(__file__).resolve().parent


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

    def test_readme_documents_schedule_overview(self):
        readme = (PROMO / "README.md").read_text(encoding="utf-8")
        self.assertIn("--schedules", readme)
        self.assertIn("--verify-schedules", readme)


if __name__ == "__main__":
    unittest.main(verbosity=2)
