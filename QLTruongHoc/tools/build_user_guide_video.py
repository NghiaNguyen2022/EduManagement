import asyncio
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / ".video-tools"
sys.path.insert(0, str(TOOLS))

import edge_tts
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

DOCX = ROOT / "docs" / "HUONG_DAN_VAN_HANH_TUAN_TU_QLTRUONGHOC.docx"
OUT = ROOT / "docs" / "video-huong-dan"
WORK = OUT / "_work"
FFMPEG = Path(imageio_ffmpeg.get_ffmpeg_exe())

STEPS = [
    ("Đăng nhập hệ thống", "Quản trị viên hoặc nhân sự được cấp tài khoản đăng nhập bằng tên đăng nhập và mật khẩu. Kiểm tra đúng họ tên, vai trò và đơn vị trước khi bắt đầu công việc."),
    ("Kiểm tra Portal quản lý đơn vị", "Quản lý đơn vị mở Portal để kiểm tra các nhóm chức năng được phân quyền. Chỉ những nghiệp vụ phù hợp với vai trò và đơn vị mới được hiển thị."),
    ("Tạo tài khoản nhân sự tại đơn vị", "Quản lý đơn vị tạo tài khoản cho kế toán, học vụ, tuyển sinh và quản lý. Nhập đủ thông tin, chọn đúng vai trò, đơn vị và trạng thái hoạt động."),
    ("Tạo hồ sơ giáo viên", "Học vụ mở danh sách giáo viên và tạo hồ sơ chuyên môn. Với trường mầm non, bổ sung nhóm lớp phụ trách; với trung tâm, bổ sung môn học và năng lực giảng dạy."),
    ("Liên kết và cấp tài khoản giáo viên", "Từ hồ sơ giáo viên, chọn chức năng cấp tài khoản. Tên đăng nhập theo quy tắc giáo viên, tên và họ; không sử dụng số điện thoại làm tên đăng nhập."),
    ("Tiếp nhận và chăm sóc tuyển sinh", "Nhân viên tuyển sinh ghi nhận học sinh hoặc học viên tiềm năng, nhu cầu học, nguồn tiếp cận và lịch hẹn. Mỗi lần liên hệ cần được cập nhật để theo dõi xuyên suốt."),
    ("Xác nhận đăng ký và hoàn thiện hồ sơ", "Khi phụ huynh hoặc học viên đồng ý nhập học, tuyển sinh xác nhận đăng ký và hoàn thiện hồ sơ. Kiểm tra thông tin cá nhân, người giám hộ, chương trình và đơn vị tiếp nhận."),
    ("Tạo chương trình và lớp học", "Học vụ thiết lập chương trình đào tạo, khối hoặc cấp độ, sau đó tạo lớp phù hợp. Trường mầm non quản lý theo độ tuổi; trung tâm quản lý theo khóa học và trình độ."),
    ("Phân công giáo viên và xếp lớp", "Học vụ chọn giáo viên phù hợp, phân công vào lớp và xếp học sinh hoặc học viên. Kiểm tra sĩ số, thời gian học và điều kiện chuyên môn trước khi xác nhận."),
    ("Lập thời khóa biểu và sinh buổi học", "Học vụ thiết lập ngày học, khung giờ, phòng học và giáo viên. Sau khi lưu, hệ thống sinh các buổi học để giáo viên có dữ liệu điểm danh và báo giảng."),
    ("Bắt đầu buổi học và điểm danh", "Giáo viên mở Portal, chọn đúng buổi học và thực hiện điểm danh. Trạng thái có mặt, vắng, đi muộn hoặc có phép phải được ghi nhận chính xác."),
    ("Tiếp nhận và xử lý đơn xin phép", "Phụ huynh hoặc giáo viên gửi đơn xin phép trên Portal. Người có trách nhiệm kiểm tra thời gian, lý do, người liên quan và cập nhật kết quả xử lý."),
    ("Ghi nhận trao đổi với phụ huynh", "Giáo viên và đơn vị ghi nhận nội dung trao đổi liên quan đến học tập, sức khỏe hoặc sinh hoạt. Nội dung cần ngắn gọn, rõ ràng và đúng phạm vi học sinh."),
    ("Tạo và gửi thông báo", "Người được phân quyền tạo thông báo, chọn phạm vi toàn trường, đơn vị, lớp hoặc cá nhân. Trước khi gửi cần kiểm tra tiêu đề, nội dung, thời gian và đối tượng nhận."),
    ("Tạo kỳ thu, công nợ và thu tiền", "Kế toán tạo kỳ thu, khoản thu và công nợ theo lớp hoặc học sinh. Khi nhận tiền, mở form thu tiền, kiểm tra số tiền và phương thức, sau đó lưu và in phiếu."),
    ("Xử lý điều chỉnh và chi phí", "Kế toán ghi nhận miễn giảm, hoàn trả, điều chỉnh công nợ và các khoản chi phí phát sinh. Mọi thay đổi cần có lý do và được đối chiếu trước khi khóa kỳ."),
    ("Cập nhật kết quả học tập, thi và chứng chỉ", "Giáo viên hoặc học vụ nhập nhận xét, điểm số và kết quả thi. Với trung tâm, kiểm tra điều kiện hoàn thành trước khi cấp chứng chỉ hoặc xác nhận kết quả."),
    ("Kiểm tra Portal từng vai trò", "Đăng nhập lần lượt bằng tài khoản quản lý, tuyển sinh, học vụ, kế toán và giáo viên. Xác nhận menu, dữ liệu và thao tác đúng với quyền đã thiết kế."),
    ("Kiểm tra Portal phụ huynh đa đơn vị", "Dùng tài khoản phụ huynh có nhiều con ở nhiều đơn vị. Kiểm tra thông báo, lịch học, kết quả và công nợ của từng học sinh đều được tổng hợp đầy đủ."),
    ("Đối chiếu báo cáo và bàn giao dữ liệu demo", "Quản trị và các bộ phận đối chiếu dữ liệu tuyển sinh, lớp học, lịch học, công nợ và kết quả. Hoàn tất checklist trước khi bàn giao hoặc sử dụng trình diễn."),
]


def font(size: int, bold: bool = False):
    candidates = [
        Path(r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"),
        Path(r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def wrap(draw, text, fnt, max_width):
    words, lines, current = text.split(), [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def extract_images():
    image_dir = WORK / "source-images"
    image_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(DOCX) as archive:
        names = sorted(
            [n for n in archive.namelist() if n.startswith("word/media/")],
            key=lambda n: int("".join(filter(str.isdigit, Path(n).stem)) or "0"),
        )
        paths = []
        for index, name in enumerate(names, 1):
            target = image_dir / f"{index:02d}{Path(name).suffix.lower()}"
            target.write_bytes(archive.read(name))
            try:
                with Image.open(target) as im:
                    if im.width >= 500 and im.height >= 250:
                        paths.append(target)
            except Exception:
                pass
    return paths


def make_slide(index, title, narration, screenshot, target):
    canvas = Image.new("RGB", (1920, 1080), "#f4f7f8")
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, 1920, 18), fill="#0f8b8d")
    draw.rounded_rectangle((80, 72, 1840, 1000), radius=34, fill="#ffffff", outline="#d9e2e8", width=2)
    draw.text((130, 115), "VIREON · HƯỚNG DẪN VẬN HÀNH", font=font(24, True), fill="#0f8b8d")
    draw.rounded_rectangle((130, 180, 245, 295), radius=24, fill="#10243e")
    draw.text((162, 207), f"{index:02d}", font=font(44, True), fill="#ffffff")
    title_lines = wrap(draw, title, font(48, True), 560)
    y = 335
    for line in title_lines:
        draw.text((130, y), line, font=font(48, True), fill="#10243e")
        y += 62
    body_lines = wrap(draw, narration, font(27), 570)
    y += 26
    for line in body_lines[:9]:
        draw.text((130, y), line, font=font(27), fill="#536579")
        y += 43
    draw.text((130, 930), "Xem chi tiết trong tài liệu hướng dẫn vận hành", font=font(21), fill="#7c8a99")

    if screenshot and screenshot.exists():
        try:
            with Image.open(screenshot).convert("RGB") as shot:
                box = (760, 130, 1785, 920)
                max_w, max_h = box[2] - box[0], box[3] - box[1]
                shot.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
                x = box[0] + (max_w - shot.width) // 2
                y2 = box[1] + (max_h - shot.height) // 2
                draw.rounded_rectangle((x - 12, y2 - 12, x + shot.width + 12, y2 + shot.height + 12), radius=16, fill="#eef3f5")
                canvas.paste(shot, (x, y2))
        except Exception:
            pass
    canvas.save(target, quality=95)


async def synthesize(text, voice, output):
    communicate = edge_tts.Communicate(text=text, voice=voice, rate="-4%")
    await communicate.save(str(output))


def run_ffmpeg(args):
    import subprocess
    subprocess.run([str(FFMPEG), "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def duration_seconds(audio):
    import subprocess
    result = subprocess.run(
        [str(FFMPEG), "-i", str(audio), "-f", "null", "-"],
        capture_output=True,
        text=True,
    )
    import re
    matches = re.findall(r"time=(\d+):(\d+):([\d.]+)", result.stderr)
    if not matches:
        return 20.0
    h, m, s = matches[-1]
    return int(h) * 3600 + int(m) * 60 + float(s)


def srt_time(seconds):
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if WORK.exists():
        shutil.rmtree(WORK)
    WORK.mkdir(parents=True)
    images = extract_images()
    segments = []
    subtitles = []
    elapsed = 0.0

    for idx, (title, narration) in enumerate(STEPS, 1):
        slide = WORK / f"slide-{idx:02d}.jpg"
        audio = WORK / f"audio-{idx:02d}.mp3"
        segment = WORK / f"segment-{idx:02d}.mp4"
        screenshot = images[(idx - 1) % len(images)] if images else None
        make_slide(idx, title, narration, screenshot, slide)
        voice = "vi-VN-NamMinhNeural" if idx % 2 else "vi-VN-HoaiMyNeural"
        await synthesize(f"Bước {idx}. {title}. {narration}", voice, audio)
        duration = duration_seconds(audio) + 1.2
        run_ffmpeg([
            "-loop", "1", "-i", str(slide), "-i", str(audio),
            "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "160k", "-shortest", "-t", f"{duration:.2f}",
            "-vf", "fade=t=in:st=0:d=0.35,fade=t=out:st={}:d=0.35".format(max(0, duration - 0.35)),
            str(segment),
        ])
        segments.append(segment)
        subtitles.append(f"{idx}\n{srt_time(elapsed)} --> {srt_time(elapsed + duration)}\nBước {idx}. {title}\n")
        elapsed += duration

    concat = WORK / "concat.txt"
    concat.write_text("\n".join(f"file '{p.as_posix()}'" for p in segments), encoding="utf-8")
    final = OUT / "QLTRUONGHOC_HUONG_DAN_VAN_HANH_20_BUOC.mp4"
    run_ffmpeg(["-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(final)])
    (OUT / "QLTRUONGHOC_HUONG_DAN_VAN_HANH_20_BUOC.srt").write_text("\n".join(subtitles), encoding="utf-8")
    print(final)


if __name__ == "__main__":
    asyncio.run(main())
