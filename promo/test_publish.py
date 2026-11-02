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
import random
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


class ShortsContentUpgradeTest(unittest.TestCase):
    """새 제작의 문제·정답·연재 및 게시 메타 일관성."""

    def setUp(self):
        import make_shorts
        import random
        self.shorts = make_shorts
        self.random = random

    def test_listening_titles_do_not_reveal_answers_even_for_old_sidecars(self):
        for kind in ("numbers", "dictation"):
            for row in publish.load_kind_rows(kind):
                item = publish.kind_row_item(kind, row)
                item["title_head"] = item["meaning"]  # 기존 사이드카의 정답 제목
                title = publish.kind_title(kind, [item])
                self.assertNotIn(item["meaning"], title)
        item = {"term": "implement", "meaning": "carry out"}
        self.assertNotIn(item["meaning"], publish.quiz_title([item]))

    def test_all_quiz_options_use_the_same_order_in_sidecar_and_description(self):
        for kind in ("numbers", "traps", "grammar", "confusables"):
            rows = publish.load_kind_rows(kind)
            picked = [[r["term"], "", "", r["meaning"], r["example"], r["translation"], "", i, r]
                      for i, r in enumerate(rows[:8])]
            self.shorts.shuffle_quiz_options(picked, self.random.Random(17))
            self.assertGreater(len({w[8]["opts"].index(w[8]["a"]) for w in picked}), 1)
            for w in picked:
                r = w[8]
                item = publish.kind_row_item(kind, r)
                desc = publish.quiz_desc([item], "https://example.com", kind)
                letter = "ABCD"[r["opts"].index(r["a"])]
                self.assertIn(f"정답: {letter}. {r['a']}", desc)
                with tempfile.TemporaryDirectory() as td:
                    out = Path(td) / "video.mp4"
                    self.shorts.write_sidecar(out, kind=kind, unit_no=None, items=[w], voices=[],
                                              quiz=[{"options": r["opts"]}])
                    saved = json.loads(out.with_suffix(".json").read_text(encoding="utf-8"))
                    self.assertEqual(saved["items"][0]["options"], r["opts"])

    def test_sprint_is_one_day_and_in_order(self):
        rows = publish.load_kind_rows("sprint")
        items = [[r["term"], "", "", "", "", "", "", i, r] for i, r in enumerate(rows)]
        self.assertEqual(self.shorts.select_content(items, "sprint", 7, self.random.Random(2))[0][0], "DAY 1")
        remaining = [w for w in items if w[0] not in ("DAY 1", "DAY 2")]
        picked = self.shorts.select_content(remaining, "sprint", 7, self.random.Random(3))
        self.assertEqual([w[0] for w in picked], ["DAY 3"])
        self.assertGreaterEqual(len(rows[0]["bullets"]), 2)

    def test_grammar_group_stays_on_one_topic(self):
        rows = publish.load_kind_rows("grammar")
        items = [[r["term"], "", "", "", "", "", "", i, r] for i, r in enumerate(rows)]
        picked = self.shorts.select_content(items, "grammar", 5, self.random.Random(4))
        self.assertEqual(len({w[8]["tag"] for w in picked}), 1)

    def test_listening_requires_audio(self):
        for kind in ("numbers", "minimal", "dictation"):
            argv = ["make_shorts.py", "--kind", kind, "--no-tts", "--dry-run"]
            with self.subTest(kind=kind), mock.patch.object(sys, "argv", argv), \
                    mock.patch.object(self.shorts, "ensure_maruburi"):
                with self.assertRaises(SystemExit) as exc:
                    self.shorts.main()
                self.assertIn("음성이 필요", str(exc.exception))

    def test_quiz_audio_leaves_thinking_time_after_speech(self):
        with tempfile.TemporaryDirectory() as td, \
                mock.patch.object(self.shorts, "tts_speak", return_value=Path(td) / "speech.wav"), \
                mock.patch.object(self.shorts, "probe_duration", return_value=5.0), \
                mock.patch.object(self.shorts.subprocess, "run") as run:
            def fake_run(cmd, **kwargs):
                Path(cmd[-1]).write_bytes(b"wav")
                return types.SimpleNamespace(returncode=0, stderr=b"")
            run.side_effect = fake_run
            _, duration = self.shorts.build_audio("", "hello", ["voice"], 6, Path(td), 0,
                                                   think_sec=3)
            self.assertEqual(duration, 8)

    def test_auto_plan_uses_new_setting_and_allows_override(self):
        cfg = {"promo": {"default_words": 5}}
        calls = []
        def build(_cfg, _kind, words):
            calls.append(words)
            return None
        with mock.patch.object(publish, "build_shorts_command", side_effect=build):
            publish.run_auto_plan(cfg, 1, kind="unit")
            cfg["promo"]["default_focus_words"] = 2
            publish.run_auto_plan(cfg, 1, kind="unit")
            publish.run_auto_plan(cfg, 1, kind="unit", words=5)
        self.assertEqual(calls, [1, 2, 5])

    def test_auto_plan_menu_passes_config_to_scheduling(self):
        cfg = {"promo": {"default_focus_words": 2, "default_privacy": "unlisted"}}
        when = datetime.now().astimezone() + timedelta(days=1)
        with mock.patch.object(publish, "ask_int", side_effect=[2, 2, 1]), \
                mock.patch.object(publish, "choose_option", side_effect=["unit", "s", "native"]), \
                mock.patch.object(publish, "choose_platforms_menu", return_value="yt"), \
                mock.patch.object(publish, "ask_publish_at", return_value=when), \
                mock.patch.object(publish, "ask_yes_no", return_value=True), \
                mock.patch.object(publish, "run_auto_plan") as plan:
            publish.auto_plan_menu(cfg)
        self.assertEqual(plan.call_args.kwargs["words"], 2)
        self.assertEqual(plan.call_args.kwargs["privacy"], "unlisted")
        self.assertTrue(plan.call_args.kwargs["dry_run"])

    def test_profile_cta_and_no_false_zero(self):
        args = argparse.Namespace(title=None, desc=None, unit=1, video=None, allow_repeat=True)
        with mock.patch.object(publish, "sidecar_for", return_value=None):
            meta = publish.build_meta({}, args)
        self.assertIn("채널 프로필", meta["desc"])
        with tempfile.TemporaryDirectory() as td, \
                mock.patch.object(publish, "HISTORY_FILE", Path(td) / "history.csv"), \
                mock.patch.object(publish, "REPORT_DIR", Path(td) / "reports"), \
                mock.patch.object(publish, "PERF_FILE", Path(td) / "missing.json"), \
                mock.patch.object(publish, "SCHEDULE_FILE", Path(td) / "schedules.json"), \
                mock.patch.object(publish, "NATIVE_SCHEDULE_FILE", Path(td) / "native.json"):
            publish.append_history(event="publish", status="success", platform="yt", video="v.mp4")
            html = publish.write_history_report(open_after=False).read_text(encoding="utf-8")
            self.assertIn("미수집", html)


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


class WeeklyWizardTest(unittest.TestCase):
    """생성 후 명시적으로 승인한 영상만 예약하고 실패 시 중단합니다."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.videos = [self.root / f"v{i}.mp4" for i in range(3)]
        for i, video in enumerate(self.videos):
            video.write_bytes(f"video{i}".encode())
            video.with_suffix(".json").write_text(json.dumps({"kind": "frequency", "items": [
                {"term": f"word{i}", "meaning": "뜻", "example": "Example.",
                 "translation": "예문."}]}), encoding="utf-8")
        self.cfg = {"youtube": {"enabled": True}}
        self.start = (datetime.now().astimezone() + timedelta(days=1)).replace(second=0, microsecond=0)

    def tearDown(self):
        self.tmp.cleanup()

    def run_wizard(self, answers, upload=None, after_review=None):
        upload = upload or mock.Mock(return_value={"yt": "https://youtu.be/abc"})
        def yes_no(prompt, default=True):
            answer = next(answers)
            if after_review:
                after_review(prompt)
            return answer
        with mock.patch.object(publish, "ask_int", side_effect=[3, 1, 1]), \
                mock.patch.object(publish, "choose_option", return_value="frequency"), \
                mock.patch.object(publish, "ask_yes_no", side_effect=yes_no), \
                mock.patch.object(publish, "ask_publish_at", return_value=self.start), \
                mock.patch.object(publish, "run_auto_plan", return_value=self.videos) as generate, \
                mock.patch.object(publish, "probe_video_info", return_value={"width": 1080, "height": 1920, "duration": 15}), \
                mock.patch.object(publish, "open_path") as player, \
                mock.patch.object(publish, "print_quota_status"), \
                mock.patch.object(publish, "publish_single", upload):
            publish.weekly_wizard_menu(self.cfg)
        return generate, player, upload

    def test_only_approved_videos_are_scheduled_at_daily_intervals(self):
        # 생성 승인, 각 영상 재생/승인, 최종 예약 승인
        answers = iter([True, True, True, False, False, True, True, True])
        generate, player, upload = self.run_wizard(answers)
        generate.assert_called_once_with(self.cfg, 3, "frequency", words=1, vary_looks=True)
        self.assertEqual(player.call_count, 2)
        self.assertEqual([c.args[2] for c in upload.call_args_list], [self.videos[0], self.videos[2]])
        self.assertEqual([c.args[1].publish_at for c in upload.call_args_list],
                         publish.plan_publish_times(self.start, 2, 1))
        for call in upload.call_args_list:
            self.assertFalse(call.args[1].dry_run)
            self.assertFalse(call.args[1].manual_fallback)
            self.assertEqual(call.args[1].platforms, "yt")

    def test_no_approval_or_final_confirmation_means_no_upload(self):
        for answers in ([True, False, False, False, False, False, False],
                        [True, False, True, False, False, False, False, False]):
            with self.subTest(answers=answers):
                _, _, upload = self.run_wizard(iter(answers))
                upload.assert_not_called()

    def test_failure_stops_subsequent_uploads(self):
        upload = mock.Mock(side_effect=[{"yt": "https://youtu.be/first"}, {"yt": None}])
        _, _, result = self.run_wizard(iter([True, False, True, False, True, False, True, True]), upload)
        self.assertEqual(result.call_count, 2)

    def test_modified_video_or_sidecar_stops_before_upload(self):
        for suffix in (".mp4", ".json"):
            def modify(prompt):
                if "지금 YouTube" in prompt:
                    self.videos[0].with_suffix(suffix).write_bytes(b"changed")
            with self.subTest(suffix=suffix):
                _, _, upload = self.run_wizard(iter([True, False, True, False, False, False, False, True]),
                                               after_review=modify)
                upload.assert_not_called()
                if suffix == ".mp4":
                    self.videos[0].write_bytes(b"video0")

    def test_generation_cancel_and_missing_meta_are_safe(self):
        with mock.patch.object(publish, "ask_int", side_effect=[3, 1]), \
                mock.patch.object(publish, "choose_option", return_value="auto"), \
                mock.patch.object(publish, "ask_yes_no", return_value=False), \
                mock.patch.object(publish, "run_auto_plan") as generate:
            publish.weekly_wizard_menu(self.cfg)
            generate.assert_not_called()
        self.videos[0].with_suffix(".json").unlink()
        _, _, upload = self.run_wizard(iter([True, False, False, False, False]))
        upload.assert_not_called()


class QuickTenScheduleTest(unittest.TestCase):
    """준비된 영상 선택, 하루 두 번 예약 및 중단 시 중복 방지."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.videos = [Path(self.tmp.name) / f"v{i}.mp4" for i in range(10)]
        for i, video in enumerate(self.videos):
            video.write_bytes(f"video{i}".encode())
            video.with_suffix(".json").write_text(json.dumps({"kind": "frequency", "items": [
                {"term": f"word{i}", "meaning": "뜻", "example": "Example.",
                 "translation": "예문."}]}), encoding="utf-8")
        self.cfg = {"youtube": {"enabled": True}}
        self.first = (datetime.now().astimezone() + timedelta(days=1)).replace(hour=8, minute=0, second=0, microsecond=0)
        self.second = self.first.replace(hour=20)

    def run_quick(self, count=10, confirm=True, upload=None, check=None,
                  mutate=None, posted=None, videos=None, cfg=None, quota=None):
        """새 흐름 — 묻지 않고 최신순 자동 선택, 내일부터 오전 8시대에 하루 2편."""
        # 실제 게시 이력에 의존하지 않도록 한도 상태를 고정합니다(한도 테스트만 따로 넘김).
        quota = quota or {"used": 0, "max": 6, "remaining": 6, "units_used": 0,
                          "units_total": 10000,
                          "reset_at": datetime.now().astimezone() + timedelta(hours=8),
                          "last_upload": None, "recent_24h": 0, "channel_unlock_at": None}
        upload = upload or mock.Mock(
            side_effect=lambda _cfg, args, video: {"yt": f"https://youtu.be/{video.stem}"})
        def ask_confirm(*_args):
            if mutate:
                mutate()
            return confirm
        checks: list[int] = []
        def verified(_cfg, ids):
            # 영상 이름이 아니라 실제 업로드 순서로 예약 시각을 돌려줍니다(파일명 규칙 무관).
            when = upload.call_args_list[len(checks)].args[1].publish_at
            checks.append(1)
            return {ids[0]: {"privacy": "private", "publish_at": when}}, True
        with mock.patch.object(publish, "list_videos_menu", return_value=videos or self.videos), \
                mock.patch.object(publish, "youtube_quota_status", return_value=quota), \
                mock.patch.object(publish, "ask_yes_no", side_effect=ask_confirm) as confirm_mock, \
                mock.patch.object(publish, "posted_platforms", side_effect=posted or (lambda _v: {})), \
                mock.patch.object(publish, "load_full_youtube_credentials", return_value=object()), \
                mock.patch.object(publish, "probe_video_info", return_value={"width": 1080, "height": 1920, "duration": 60}), \
                mock.patch.object(publish, "publish_single", upload), \
                mock.patch.object(publish, "fetch_youtube_status", side_effect=check or verified):
            publish.quick_ten_schedule_menu(cfg or self.cfg, count)
        return upload, confirm_mock

    def test_automatically_picks_ten_videos_two_per_day(self):
        upload, confirm = self.run_quick()
        self.assertEqual(upload.call_count, 10, "사용자가 고르지 않아도 10편을 자동 선별해야 합니다")
        slots = publish.QUICK_SCHEDULE_SLOTS
        day = (datetime.now().astimezone() + timedelta(days=1)).date()
        expected = [publish.publish_at_iso(datetime.fromisoformat(
            f"{day + timedelta(days=i // 2)}T{slots[i % len(slots)]}").astimezone())
            for i in range(10)]
        self.assertEqual([call.args[1].publish_at for call in upload.call_args_list], expected)
        self.assertTrue(all(not call.args[1].allow_repeat and not call.args[1].manual_fallback
                            for call in upload.call_args_list))
        confirm.assert_called_once()

    def test_newest_first_and_count_limit(self):
        videos = []
        for i in range(25):
            video = Path(self.tmp.name) / f"many{i}.mp4"
            video.write_bytes(f"many{i}".encode())
            video.with_suffix(".json").write_text(json.dumps({"kind": "frequency", "items": [
                {"term": f"w{i}", "meaning": "뜻", "example": "Example.",
                 "translation": "예문."}]}), encoding="utf-8")
            videos.append(video)
        upload, _ = self.run_quick(videos=videos)
        self.assertEqual(upload.call_count, 10)
        self.assertEqual([call.args[2] for call in upload.call_args_list], videos[:10],
                         "목록 순서(최신순) 그대로 10편만 골라야 합니다")

    def test_duplicate_titles_are_skipped(self):
        # 다른 영상이어도 제목이 같으면 피드에서 구분되지 않으므로 한 배치에 한 번만 올립니다.
        self.videos[1].with_suffix(".json").write_text(json.dumps({"kind": "frequency", "items": [
            {"term": "word0", "meaning": "뜻", "example": "Example.",
             "translation": "예문."}]}), encoding="utf-8")
        upload, _ = self.run_quick()
        self.assertEqual(upload.call_count, 9)
        uploaded = [c.args[2] for c in upload.call_args_list]
        self.assertIn(self.videos[0], uploaded)
        self.assertNotIn(self.videos[1], uploaded)

    def test_posted_missing_meta_and_duplicate_content_are_skipped(self):
        posted = lambda v: {"yt": {}} if v in self.videos[:3] else {}
        upload, _ = self.run_quick(posted=posted)
        self.assertEqual(upload.call_count, 7)
        self.assertEqual(upload.call_args_list[0].args[2], self.videos[3])

    def test_missing_meta_and_same_content_are_skipped(self):
        self.videos[0].with_suffix(".json").unlink()
        self.videos[1].write_bytes(self.videos[2].read_bytes())
        upload, _ = self.run_quick()
        self.assertEqual(upload.call_count, 8)
        uploaded = [c.args[2] for c in upload.call_args_list]
        self.assertNotIn(self.videos[0], uploaded, "메타 없는 영상은 제외")
        self.assertNotIn(self.videos[2], uploaded, "중복 내용은 뒤쪽(최신순)을 제외")
        self.assertIn(self.videos[1], uploaded)

    def test_all_posted_means_no_upload(self):
        self.run_quick(posted=lambda _v: {"yt": {}})[0].assert_not_called()

    def test_broken_items_are_skipped_by_quality_gate(self):
        self.videos[0].with_suffix(".json").write_text(json.dumps({"kind": "grammar", "items": [
            {"term": "q", "question": "빈칸?", "example": "He ____ home.", "meaning": "went",
             "options": ["went", "went", "go", "goes"], "translation": "과거형"}]}),
            encoding="utf-8")
        upload, _ = self.run_quick()
        self.assertEqual(upload.call_count, 9)
        self.assertEqual(upload.call_args_list[0].args[2], self.videos[1])

    def test_failure_or_unconfirmed_status_stops_after_first(self):
        upload, _ = self.run_quick(upload=mock.Mock(return_value={"yt": None}))
        self.assertEqual(upload.call_count, 1)
        upload = mock.Mock(return_value={"yt": "https://youtu.be/v0"})
        check = mock.Mock(return_value=({}, True))
        self.assertEqual(self.run_quick(upload=upload, check=check)[0].call_count, 1)
        check.assert_called_once()

    def test_partial_success_stops_on_failure(self):
        upload = mock.Mock(side_effect=[{"yt": "https://youtu.be/v0"}, {"yt": None}])
        check = mock.Mock(return_value=({"v0": {"privacy": "private",
                          "publish_at": publish.publish_at_iso(self.first)}}, True))
        self.assertEqual(self.run_quick(upload=upload, check=check)[0].call_count, 2)
        check.assert_called_once()

    def test_cancel_and_changed_file_do_not_upload(self):
        self.run_quick(confirm=False)[0].assert_not_called()
        video = self.videos[0]
        before = video.read_bytes()
        self.run_quick(mutate=lambda v=video: v.write_bytes(b"changed"))[0].assert_not_called()
        video.write_bytes(before)

    def test_one_click_when_confirmation_is_disabled(self):
        cfg = {"youtube": {"enabled": True}, "promo": {"confirm_real_upload": False}}
        upload, confirm = self.run_quick(cfg=cfg)
        self.assertEqual(upload.call_count, 10)
        confirm.assert_not_called()

    def test_quota_exhausted_warns_and_can_cancel(self):
        now = datetime.now().astimezone()
        exhausted = {"used": 10, "max": 6, "remaining": 0, "units_used": 16000,
                     "units_total": 10000, "reset_at": now + timedelta(hours=3),
                     "last_upload": now - timedelta(hours=2), "recent_24h": 10,
                     "channel_unlock_at": now + timedelta(hours=22)}
        self.run_quick(confirm=False, quota=exhausted)[0].assert_not_called()
        self.assertEqual(self.run_quick(confirm=True, quota=exhausted)[0].call_count, 10)

    def test_dates_and_times_are_automatic(self):
        """날짜·시각을 묻지 않고 내일부터 매일 08:00·08:15 로 예약합니다."""
        upload, confirm = self.run_quick()
        times = [publish.parse_schedule_time(c.args[1].publish_at)
                 for c in upload.call_args_list]
        self.assertEqual([t.strftime("%H:%M") for t in times], ["08:00", "08:15"] * 5)
        tomorrow = (datetime.now().astimezone() + timedelta(days=1)).date()
        self.assertEqual([t.date() for t in times],
                         [tomorrow + timedelta(days=i // 2) for i in range(10)])
        confirm.assert_called_once()


class QuizQualityGateTest(unittest.TestCase):
    """검토 없이 게시할 수 있도록 문항 자체를 자동 점검합니다."""

    def item(self, options, answer, why="해설", example="He ____ home."):
        return {"term": "q", "question": "빈칸?", "example": example,
                "meaning": answer, "options": options, "translation": why}

    def test_clean_item_passes(self):
        self.assertEqual(publish.sidecar_item_problems(
            [self.item(["went", "go", "goes", "gone"], "went")]), [])

    def test_duplicate_missing_or_wrong_answer_are_reported(self):
        cases = {
            "보기 4개 아님": self.item(["a", "a", "b", "c"], "a"),
            "정답 불일치": self.item(["a", "b", "c", "d"], "z"),
            "해설 없음": self.item(["a", "b", "c", "d"], "a", why=""),
        }
        for expected, item in cases.items():
            with self.subTest(expected=expected):
                self.assertTrue(any(expected in p for p in
                                    publish.sidecar_item_problems([item])), expected)

    def test_generation_keeps_only_clean_items(self):
        import make_shorts as shorts
        def row(key, opts, answer, why="해설"):
            q = {"term": key, "question": "빈칸?", "sentence": "He ____ home.", "note": "",
                 "opts": opts, "a": answer, "why": why, "tag": "1과", "key": key}
            return [key, "", "", answer, "He ____ home.", why, "", 1, q]
        pool = [row(f"ok{i}", ["a", "b", "c", "d"], "a") for i in range(6)]
        pool += [row("dup", ["a", "a", "b", "c"], "a"),
                 row("wrong", ["a", "b", "c", "d"], "z"),
                 row("nowhy", ["a", "b", "c", "d"], "a", why="")]
        picked = shorts.select_content(pool, "grammar", 4, random.Random(1))
        self.assertEqual(len(picked), 4)
        self.assertTrue(all(shorts.quiz_item_ok(w) for w in picked))


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
        calls = []
        cfg = {"promo": {"default_words": 1}, "youtube": {"enabled": True}}
        with tempfile.TemporaryDirectory() as td, \
                mock.patch.object(publish, "SHORTS_DIR", Path(td)), \
                mock.patch.object(publish, "build_shorts_command", side_effect=lambda *_: ["make"]), \
                mock.patch.object(publish, "run_menu_command",
                                  side_effect=lambda cmd: Path(cmd[cmd.index("--out") + 1]).write_bytes(b"video") > 0), \
                mock.patch.object(publish, "publish_single",
                                  side_effect=lambda _cfg, args, _video: calls.append(args)):
            videos = publish.run_auto_plan(cfg, 3, "unit", start_at=start.strftime("%Y-%m-%d %H:%M"),
                                           interval_days=2, platforms="yt", mode="native")
            self.assertEqual(len(set(videos)), 3, "같은 UNIT 영상은 서로 다른 파일이어야 합니다")
            self.assertTrue(all(video.is_file() for video in videos))
        self.assertEqual(len(calls), 3)
        self.assertEqual([c.publish_at for c in calls],
                         publish.plan_publish_times(start, 3, 2))
        self.assertTrue(all(c.platforms == "yt" for c in calls),
                        "YouTube 예약 게시는 yt 만 대상으로 해야 합니다")
        self.assertTrue(all(c.dry_run is False for c in calls))

    def test_native_plan_refuses_mixed_platforms(self):
        cfg = {"promo": {"default_words": 1}}
        with mock.patch.object(publish, "run_menu_command") as generate, \
                mock.patch.object(publish, "publish_single") as upload:
            result = publish.run_auto_plan(cfg, 1, "unit", start_at="2026-11-01 19:00",
                                           platforms="yt,ig", mode="native")
        self.assertEqual(result, [])
        generate.assert_not_called()
        upload.assert_not_called()

    def test_invalid_schedule_is_rejected_before_generation(self):
        cfg = {"promo": {"default_words": 1}}
        for when, platforms, mode in (("invalid", "yt", "native"),
                                      ("2000-01-01 00:00", "yt", "local"),
                                      ("2099-01-01 00:00", "invalid", "local")):
            with self.subTest(when=when, platforms=platforms), \
                    mock.patch.object(publish, "run_menu_command") as generate:
                self.assertEqual(publish.run_auto_plan(cfg, 1, "unit", start_at=when,
                                                      platforms=platforms, mode=mode), [])
                generate.assert_not_called()

    def test_auto_plan_does_not_double_count_used_inventory(self):
        inventories = [[{"key": "unit", "remaining": 2}], [{"key": "unit", "remaining": 1}]]
        with tempfile.TemporaryDirectory() as td, \
                mock.patch.object(publish, "SHORTS_DIR", Path(td)), \
                mock.patch.object(publish, "AUTO_KINDS", ("unit",)), \
                mock.patch.object(publish, "content_inventory", side_effect=inventories), \
                mock.patch.object(publish, "recent_content_history", return_value=[]), \
                mock.patch.object(publish, "build_shorts_command", side_effect=lambda *_: ["make"]), \
                mock.patch.object(publish, "run_menu_command",
                                  side_effect=lambda cmd: Path(cmd[cmd.index("--out") + 1]).write_bytes(b"video") > 0):
            videos = publish.run_auto_plan({"promo": {}}, 2, "auto", words=1)
        self.assertEqual(len(videos), 2)

    def test_successful_command_without_output_is_not_scheduled(self):
        with tempfile.TemporaryDirectory() as td, \
                mock.patch.object(publish, "SHORTS_DIR", Path(td)), \
                mock.patch.object(publish, "build_shorts_command", return_value=["make"]), \
                mock.patch.object(publish, "run_menu_command", return_value=True), \
                mock.patch.object(publish, "publish_single") as upload:
            result = publish.run_auto_plan({"promo": {}}, 1, "unit")
        self.assertEqual(result, [])
        upload.assert_not_called()


class VariedLookTest(unittest.TestCase):
    """메뉴 32 — 영상마다 배경·무늬·목소리가 달라야 합니다."""

    WINDOWS_VOICES = [("Microsoft Zira Desktop", "en-US", "Female"),
                      ("Microsoft David Desktop", "en-US", "Male"),
                      ("Microsoft Hazel Desktop", "en-GB", "Female"),
                      ("Microsoft George Desktop", "en-GB", "Male")]

    def test_themes_patterns_and_us_uk_voice_pairs_do_not_repeat(self):
        with mock.patch.object(publish, "list_windows_voices", return_value=self.WINDOWS_VOICES), \
                mock.patch.object(publish, "list_piper_voices", return_value=[]):
            looks = publish.varied_looks({"promo": {"default_tts": True,
                                                   "tts_engine": "windows"}}, 10)
            self.assertEqual(len({look["theme"] for look in looks}), 10)
            self.assertEqual(len({look["pattern"] for look in looks}), 10)
            self.assertGreater(len({(look["voice"], look["voice2"]) for look in looks}), 1)
            for look in looks:
                self.assertEqual({publish.voice_accent(look["voice"]),
                                  publish.voice_accent(look["voice2"])}, {"US", "GB"})

    def test_build_shorts_command_applies_per_video_look(self):
        cfg = {"promo": {"default_theme": "blue", "default_pattern": "auto",
                         "default_style": "classic", "default_tts": True,
                         "default_voice": "Microsoft Hazel Desktop",
                         "default_voice2": "Microsoft David Desktop"}}
        look = {"theme": "neon", "pattern": "bokeh", "style": "modern",
                "tts": True, "engine": "windows",
                "voice": "Microsoft Zira Desktop", "voice2": "Microsoft Hazel Desktop"}
        command = publish.build_shorts_command(cfg, "frequency", 1, look)
        joined = " ".join(command)
        self.assertIn("--bg neon", joined)
        self.assertIn("--pattern bokeh", joined)
        self.assertIn("--voice Microsoft Zira Desktop", joined)
        self.assertIn("--voice2 Microsoft Hazel Desktop", joined)

    def test_varied_menu_generates_then_schedules_only_new_videos(self):
        looks = [{"theme": "neon", "pattern": "bokeh", "voice": "a", "voice2": "b"},
                 {"theme": "mint", "pattern": "waves", "voice": "a", "voice2": "b"},
                 {"theme": "gold", "pattern": "grid", "voice": "c", "voice2": "d"}]
        videos = [Path(f"v{i}.mp4") for i in range(3)]
        with mock.patch.object(publish, "ask_int", return_value=3), \
                mock.patch.object(publish, "ask_yes_no", return_value=True), \
                mock.patch.object(publish, "varied_looks", return_value=looks), \
                mock.patch.object(publish, "load_full_youtube_credentials", return_value=object()), \
                mock.patch.object(publish, "youtube_quota_status", return_value={"remaining": 6}), \
                mock.patch.object(publish, "run_auto_plan", return_value=videos) as plan, \
                mock.patch.object(publish, "quick_ten_schedule_menu") as quick:
            publish.varied_ten_schedule_menu({"youtube": {"enabled": True}, "promo": {}})
        self.assertTrue(plan.call_args.kwargs["vary_looks"])
        # 미리 보여 준 테마·무늬·목소리 목록을 그대로 넘겨, 실제 생성과 표가 어긋나지 않게 합니다.
        self.assertIs(plan.call_args.kwargs["looks"], looks)
        quick.assert_called_once_with({"youtube": {"enabled": True}, "promo": {}}, 3,
                                      videos=videos)

    def test_varied_menu_stops_before_generation_without_full_login(self):
        looks = [{"theme": "neon", "pattern": "bokeh", "voice": "a", "voice2": "b"}]
        with mock.patch.object(publish, "ask_int", return_value=1), \
                mock.patch.object(publish, "varied_looks", return_value=looks), \
                mock.patch.object(publish, "load_full_youtube_credentials", return_value=None), \
                mock.patch.object(publish, "run_auto_plan") as plan:
            publish.varied_ten_schedule_menu({"youtube": {"enabled": True}, "promo": {}})
        plan.assert_not_called()


class ShortsCardQualityTest(unittest.TestCase):
    """카드 예문 줄바꿈과 게시 전 내용 점검 — 단어가 중간에서 잘리거나 빈 카드가 올라가지 않게 합니다."""

    def test_layout_words_keeps_words_whole(self):
        import make_shorts as shorts
        lines = shorts.layout_words("The new design enhances the product's appeal.",
                                    lambda s: len(s) * 10, 100)
        self.assertEqual(lines, ["The new", "design", "enhances", "the", "product's", "appeal."])
        self.assertIn("product's", lines)

    def test_layout_words_splits_only_words_longer_than_line(self):
        import make_shorts as shorts
        lines = shorts.layout_words("employees", lambda s: len(s) * 10, 40)
        self.assertEqual("".join(lines), "employees")
        self.assertTrue(all(len(line) <= 4 for line in lines))

    def test_content_problems_find_empty_card_fields(self):
        items = [{"term": "word", "meaning": "뜻", "example": "", "translation": ""}]
        problems = publish.sidecar_content_problems(items, "unit")
        self.assertTrue(any("예문" in p for p in problems))
        self.assertTrue(any("해석" in p for p in problems))
        self.assertEqual(publish.sidecar_content_problems(items, "grammar"), [])

    def test_content_problems_accept_complete_card(self):
        items = [{"term": "word", "meaning": "뜻", "example": "Example.", "translation": "예문."}]
        self.assertEqual(publish.sidecar_content_problems(items, "frequency"), [])


class EnglishOnlyTtsTest(unittest.TestCase):
    """TTS — 한국어 낭독 없이 미국식·영국식 영어만 읽어야 합니다."""

    def test_voice2_none_keeps_single_voice(self):
        import make_shorts as shorts
        with mock.patch.object(shorts, "us_uk_voice_pair", return_value=("us", "gb", "piper")):
            self.assertEqual(shorts.enforce_us_uk("gb", "none", False, "piper"),
                             ("gb", "none", "piper"))
            self.assertEqual(shorts.enforce_us_uk("gb", "off", False, "piper"),
                             ("gb", "off", "piper"))
            self.assertEqual(shorts.enforce_us_uk("en_GB-alan-low", "en_US-amy-low", False, "piper"),
                             ("en_GB-alan-low", "en_US-amy-low", "piper"))
            self.assertEqual(shorts.enforce_us_uk("us", "us", False, "piper"),
                             ("us", "gb", "piper"))

    def test_audio_reads_each_english_voice_once_without_korean(self):
        import make_shorts as shorts
        spoken = []

        def fake_tts(text, voice, out, engine="auto"):
            spoken.append(voice)
            Path(out).write_bytes(b"wav")
            return Path(out)

        def fake_run(cmd, **kwargs):
            Path(cmd[-1]).write_bytes(b"wav")
            return types.SimpleNamespace(returncode=0, stderr=b"")

        voices = ["Microsoft Zira Desktop", "Microsoft Hazel Desktop"]
        with tempfile.TemporaryDirectory() as td, \
                mock.patch.object(shorts, "tts_speak", side_effect=fake_tts), \
                mock.patch.object(shorts, "probe_duration", return_value=1.0), \
                mock.patch.object(shorts.subprocess, "run", side_effect=fake_run):
            shorts.build_audio("word", "Example sentence.", voices, 6, Path(td), 0)
        self.assertEqual(spoken, [voices[0]] * 2 + [voices[1]] * 2)
        self.assertFalse(any("Heami" in voice for voice in spoken))


class ScheduleParseZTest(unittest.TestCase):
    """ISO 끝의 Z(UTC) — Python 3.11 이전에서도 읽히도록 직접 처리합니다."""

    def test_trailing_z_is_accepted(self):
        parsed = publish.parse_schedule_time("2026-11-01T10:00:00Z")
        self.assertEqual(parsed.astimezone(publish.timezone.utc).hour, 10)


class ReportHtmlTest(unittest.TestCase):
    """게시 이력 리포트 — 링크 칸을 f-string 밖에서 만들어 3.8 에서도 실행돼야 합니다."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self._old = (publish.HISTORY_FILE, publish.REPORT_DIR, publish.PERF_FILE,
                     publish.SCHEDULE_FILE, publish.NATIVE_SCHEDULE_FILE)
        publish.HISTORY_FILE = Path(self.tmp.name) / "history.csv"
        publish.REPORT_DIR = Path(self.tmp.name) / "reports"
        publish.PERF_FILE = Path(self.tmp.name) / "performance.json"
        publish.SCHEDULE_FILE = Path(self.tmp.name) / "schedules.json"
        publish.NATIVE_SCHEDULE_FILE = Path(self.tmp.name) / "native.json"

    def tearDown(self):
        (publish.HISTORY_FILE, publish.REPORT_DIR, publish.PERF_FILE,
         publish.SCHEDULE_FILE, publish.NATIVE_SCHEDULE_FILE) = self._old
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

    def test_schedule_report_shows_partial_failure_and_pending_native(self):
        past = (datetime.now().astimezone() - timedelta(hours=1)).isoformat()
        publish.save_schedules([{"id": "s1", "status": "failed", "scheduled_at": past,
                                 "platforms": "yt,ig", "video": "<video>"}])
        publish.save_native_schedules([{"id": "n1", "status": "scheduled", "publish_at": past}])
        for platform, status in (("yt", "success"), ("ig", "failed"), ("ig", "dry-run")):
            publish.append_history(event="publish", status=status, schedule_id="s1", platform=platform,
                                   message="<error>" if status == "failed" else "")
        html = publish.write_history_report(open_after=False).read_text(encoding="utf-8")
        self.assertIn("부분 성공", html)
        self.assertIn("yt: success, ig: failed", html)
        self.assertIn("공개 확인 필요", html)
        self.assertIn("&lt;video&gt;", html)
        self.assertIn("&lt;error&gt;", html)
        self.assertIn("확인 필요 2건", html)

    def test_schedule_only_report_does_not_require_history(self):
        publish.save_schedules([{"id": "s2", "status": "scheduled", "scheduled_at": "bad"}])
        html = publish.write_history_report(open_after=False).read_text(encoding="utf-8")
        self.assertIn("시각 오류", html)

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
        # 이 PC 에 읽기·삭제 토큰이 있어도 '토큰 없음' 상황을 재현합니다 —
        # 실제 토큰 유무에 따라 삭제 요청이 나가면 테스트가 환경에 의존하게 됩니다.
        with mock.patch.object(publish, "load_full_youtube_credentials", return_value=None):
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
        # YouTube 상한은 태그 개수가 아니라 전체 500자입니다.
        yt = {"tags": [f"tag{i}" for i in range(600)], "category_id": "27"}
        body = publish.build_youtube_body(self.META, yt, "public")
        tags = body["snippet"]["tags"]
        self.assertLessEqual(sum(len(t) for t in tags) + max(0, len(tags) - 1), 500)
        self.assertTrue(tags)
        self.assertNotIn("tag599", tags)

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


class VideoEncodingFailureTest(unittest.TestCase):
    """인코딩 실패는 호출자에게 실패 종료 코드로 전달되어야 합니다."""

    def test_failed_encoder_exits_nonzero(self):
        import make_shorts
        argv = ["make_shorts.py", "--unit", "1", "--index", "0", "--no-tts",
                "--no-intro", "--no-outro", "--no-ambient"]
        with mock.patch.object(sys, "argv", argv), \
                mock.patch.object(make_shorts, "ensure_maruburi"), \
                mock.patch.object(make_shorts, "render_slide", return_value=object()), \
                mock.patch.object(make_shorts, "render_slide_frames", return_value=None), \
                mock.patch.object(make_shorts, "run_ffmpeg", return_value=False):
            with self.assertRaises(SystemExit) as exc:
                make_shorts.main()
        self.assertNotEqual(exc.exception.code, 0)


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


class ShortsAuditTest(unittest.TestCase):
    """메뉴 33 — 영상별 예약 가능/제외 사유 점검(업로드 없음)."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def make_video(self, name, meta=None):
        video = self.dir / name
        video.write_bytes(b"video")
        if meta is not None:
            video.with_suffix(".json").write_text(json.dumps(meta), encoding="utf-8")
        return video

    def audit(self, videos, info=None, posted=None):
        info = info or {"width": 1080, "height": 1920, "duration": 60}
        with mock.patch.object(publish, "list_videos_menu", return_value=videos), \
                mock.patch.object(publish, "posted_platforms", side_effect=posted or (lambda _v: {})), \
                mock.patch.object(publish, "probe_video_info", return_value=info):
            return publish.audit_shorts({})

    def test_splits_ready_and_blocked(self):
        good = self.make_video("good.mp4", {"kind": "frequency", "items": [
            {"term": "equipment", "meaning": "장비", "example": "The equipment is new.",
             "translation": "그 장비는 새것이다."}]})
        bad = self.make_video("bad.mp4")  # 메타 없음 → 제외
        result = self.audit([good, bad])
        self.assertEqual(result["total"], 2)
        self.assertEqual([row["video"].name for row in result["ready"]], ["good.mp4"])
        self.assertEqual([video.name for video, _ in result["blocked"]], ["bad.mp4"])
        self.assertIn("메타 없음", result["blocked"][0][1])

    def test_flags_bad_ratio_and_already_posted(self):
        video = self.make_video("wide.mp4", {"kind": "frequency", "items": [
            {"term": "equipment", "meaning": "장비", "example": "The equipment is new.",
             "translation": "그 장비는 새것이다."}]})
        narrow = self.audit([video], info={"width": 1920, "height": 1080, "duration": 60})
        self.assertIn("9:16 아님", narrow["blocked"][0][1])
        posted = self.audit([video], posted=lambda _v: {"yt": "https://youtu.be/x"})
        self.assertIn("이미 게시", posted["blocked"][0][1])


if __name__ == "__main__":
    unittest.main(verbosity=2)
