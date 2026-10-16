#!/usr/bin/env node
/**
 * fetch.js — Tải file user gửi (link) vào jobs/<job>/input/ và tự giải nén.
 *
 *   node scripts/fetch.js <job> <link1> [link2 ...]
 *   node scripts/fetch.js <job> --unzip            # chỉ giải nén các file nén đang có trong input/
 *
 * Hỗ trợ:
 *   - Link tải thẳng (http/https)
 *   - Google Drive file: drive.google.com/file/d/<ID>/... hoặc ?id=<ID> (file phải để "Bất kỳ ai có link")
 *   - Google Drive THƯ MỤC: không tải được bằng script → nhờ user nén thành .zip hoặc gửi từng file
 *   - Giải nén: .zip (unzip), .rar/.7z (7z hoặc unrar nếu máy có)
 *
 * Tên file tiếng Việt / khoảng trắng được giữ nguyên trong input/ — bước to-webp mới đổi tên.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const C = require('./lib/core');

const { pos, opt } = C.parseArgs();
const j = C.loadJob(pos.shift());
const IN = path.join(C.jobDir(j.id), 'input');
fs.mkdirSync(IN, { recursive: true });

(async () => {
    for (const link of pos) {
        try {
            const f = await download(link);
            C.ok('Tải ' + path.basename(f));
            C.log(j, 'tải ' + link + ' → input/' + path.basename(f));
        } catch (e) { console.error('✗ ' + link + ' — ' + e.message); }
    }
    unpackAll();
})();

function driveId(u) {
    const m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]{20,})/);
    return m && m[1];
}

async function download(link) {
    if (/drive\.google\.com\/drive\/folders\//.test(link)) throw new Error('Link THƯ MỤC Drive — nhờ user nén .zip hoặc gửi link từng file.');
    const id = driveId(link);
    let url = id ? `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t` : link;
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const type = res.headers.get('content-type') || '';
    if (id && type.includes('text/html')) throw new Error('Drive trả về trang HTML — file chưa mở quyền "Bất kỳ ai có link".');
    let name = (res.headers.get('content-disposition') || '').match(/filename\*?=(?:UTF-8'')?"?([^";]+)/i)?.[1];
    name = name ? decodeURIComponent(name) : (path.basename(new URL(url).pathname) || 'file');
    if (!path.extname(name)) name += extFromType(type);
    let dest = path.join(IN, name.replace(/[\\/:*?"<>|]/g, '_'));
    for (let n = 2; fs.existsSync(dest); n++) dest = path.join(IN, path.parse(name).name + '-' + n + path.extname(name));
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    return dest;
}

function extFromType(t) {
    return { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/heic': '.heic', 'application/zip': '.zip', 'audio/mpeg': '.mp3', 'application/pdf': '.pdf' }[t.split(';')[0]] || '';
}

function has(bin) { try { execFileSync('which', [bin], { stdio: 'ignore' }); return true; } catch { return false; } }

function unpackAll() {
    for (const f of fs.readdirSync(IN)) {
        const p = path.join(IN, f), ext = path.extname(f).toLowerCase();
        if (!['.zip', '.rar', '.7z'].includes(ext)) continue;
        const out = path.join(IN, path.parse(f).name);
        if (fs.existsSync(out)) continue;
        try {
            if (ext === '.zip' && has('unzip')) execFileSync('unzip', ['-q', '-o', p, '-d', out]);
            else if (has('7z')) execFileSync('7z', ['x', '-y', '-o' + out, p], { stdio: 'ignore' });
            else if (ext === '.rar' && has('unrar')) { fs.mkdirSync(out); execFileSync('unrar', ['x', '-o+', p, out + '/'], { stdio: 'ignore' }); }
            else { console.error('✗ Không có công cụ giải nén ' + ext + ' (cài: sudo apt install unzip p7zip-full)'); continue; }
            // bỏ rác macOS
            fs.rmSync(path.join(out, '__MACOSX'), { recursive: true, force: true });
            fs.rmSync(p);
            C.ok('Giải nén ' + f + ' → input/' + path.basename(out) + '/');
            C.log(j, 'giải nén ' + f);
        } catch (e) { console.error('✗ Giải nén ' + f + ' lỗi: ' + e.message); }
    }
    if (opt.unzip && !pos.length) C.ok('Xong.');
}
