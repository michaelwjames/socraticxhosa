# Socratic Xhosa - Practice Array Editor (Tkinter)
# Run: python tools/practice_editor.py

import json
from pathlib import Path
from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox

DATA_FILES_ORDER = [
    'foundation_lessons.json',          # 1–10
    'part2_lessons_11_25.json',         # 11–25
    'part3_lessons_26_30.json',         # 26–30
    'part3_lessons_31_35.json',         # 31–35
    'part4_lessons_36_40.json',         # 36–40
    'part4_lessons_41_45.json',         # 41–45
    'part4_lessons_46_50.json',         # 46–50
]

class PracticeEditorApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Socratic Xhosa: Practice Editor (Local)')
        self.geometry('1000x700')

        # Paths
        self.root_dir: Path = Path(__file__).resolve().parent
        # Now that the script lives in tools/, JSON lives one level up in public/data
        self.data_dir: Path = self.root_dir.parent / 'public' / 'data'
        self.backup_dir: Path = self.data_dir / 'backups'
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        # Data containers
        self.file_records = []  # list of {'path': Path, 'data': dict}
        self.index_map = {}     # global_lesson_number -> (file_idx, local_idx)
        self.lesson_options = []

        # State
        self.current_lesson_num = None
        self.unsaved_changes = False
        self.item_widgets = []  # list of {'prompt': Text, 'answer': Text}

        # Load JSON
        self._load_all_files()

        # UI
        self._build_topbar()
        self._build_scrollable_editor()

        # Default selection
        if self.lesson_options:
            self.lesson_combo.current(0)
            self._on_select_lesson()

        # Bindings
        self.bind_all('<Control-s>', lambda e: self._save())
        self.protocol('WM_DELETE_WINDOW', self._on_quit)

    # ---------------------- Data Loading ----------------------
    def _load_all_files(self):
        self.file_records.clear()
        self.index_map.clear()
        self.lesson_options.clear()

        global_num = 1
        for fname in DATA_FILES_ORDER:
            fpath = self.data_dir / fname
            if not fpath.exists():
                messagebox.showerror('Missing file', f'File not found:\n{fpath}')
                continue
            try:
                with fpath.open('r', encoding='utf-8') as f:
                    data = json.load(f)
            except Exception as e:
                messagebox.showerror('Load error', f'Failed to load {fpath.name}: {e}')
                continue

            lessons = data.get('lessons', [])
            file_idx = len(self.file_records)
            self.file_records.append({'path': fpath, 'data': data})

            for local_idx, lesson in enumerate(lessons):
                title = lesson.get('lesson_title') or lesson.get('title') or f'Lesson {global_num}'
                display = f"{global_num}: {self._strip_md(str(title))}"
                self.index_map[global_num] = (file_idx, local_idx)
                self.lesson_options.append(display)
                global_num += 1

    @staticmethod
    def _strip_md(text: str) -> str:
        return text.replace('**', '').strip()

    def _get_lesson_by_number(self, lesson_num: int):
        fi, li = self.index_map[lesson_num]
        record = self.file_records[fi]
        lesson = record['data']['lessons'][li]
        return record, lesson, fi, li

    # ---------------------- UI ----------------------
    def _build_topbar(self):
        top = ttk.Frame(self)
        top.pack(fill='x', padx=10, pady=8)

        ttk.Label(top, text='Lesson:').pack(side='left')
        self.lesson_var = tk.StringVar()
        self.lesson_combo = ttk.Combobox(
            top,
            textvariable=self.lesson_var,
            values=self.lesson_options,
            width=85,
            state='readonly'
        )
        self.lesson_combo.pack(side='left', padx=8)
        self.lesson_combo.bind('<<ComboboxSelected>>', self._on_select_lesson)

        ttk.Button(top, text='Save (Ctrl+S)', command=self._save).pack(side='left', padx=(4, 0))
        ttk.Button(top, text='Reload lesson', command=self._reload_current_from_disk).pack(side='left', padx=6)
        ttk.Button(top, text='Add practice item', command=self._add_item).pack(side='left', padx=6)

        # Info label
        self.info_var = tk.StringVar(value=str(self.data_dir))
        info = ttk.Label(top, textvariable=self.info_var, foreground='#666')
        info.pack(side='right')

    def _build_scrollable_editor(self):
        container = ttk.Frame(self)
        container.pack(fill='both', expand=True)

        self.canvas = tk.Canvas(container, borderwidth=0, highlightthickness=0)
        vscroll = ttk.Scrollbar(container, orient='vertical', command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=vscroll.set)

        vscroll.pack(side='right', fill='y')
        self.canvas.pack(side='left', fill='both', expand=True)

        self.inner = ttk.Frame(self.canvas)
        self.canvas_window = self.canvas.create_window((0, 0), window=self.inner, anchor='nw')

        self.inner.bind('<Configure>', lambda e: self.canvas.configure(scrollregion=self.canvas.bbox('all')))
        self.canvas.bind('<Configure>', self._on_canvas_configure)

        # Mouse wheel support
        self.canvas.bind_all('<MouseWheel>', self._on_mousewheel)
        self.canvas.bind_all('<Button-4>', self._on_mousewheel_linux)
        self.canvas.bind_all('<Button-5>', self._on_mousewheel_linux)

    def _on_canvas_configure(self, event):
        self.canvas.itemconfig(self.canvas_window, width=event.width)

    def _on_mousewheel(self, event):
        delta = int(-1 * (event.delta / 120))
        self.canvas.yview_scroll(delta, 'units')

    def _on_mousewheel_linux(self, event):
        if event.num == 4:
            self.canvas.yview_scroll(-1, 'units')
        elif event.num == 5:
            self.canvas.yview_scroll(1, 'units')

    # ---------------------- Lesson selection ----------------------
    def _set_combo_to_current(self):
        if self.current_lesson_num is None:
            return
        target_prefix = f"{self.current_lesson_num}:"
        for i, opt in enumerate(self.lesson_options):
            if opt.startswith(target_prefix):
                self.lesson_combo.current(i)
                break

    def _on_select_lesson(self, event=None):
        if self.unsaved_changes:
            if not messagebox.askyesno('Unsaved changes', 'Discard unsaved changes?'):
                self._set_combo_to_current()
                return

        sel = self.lesson_var.get()
        if not sel:
            return
        try:
            lesson_num = int(sel.split(':', 1)[0])
        except ValueError:
            return
        self.current_lesson_num = lesson_num
        self.unsaved_changes = False
        self._render_practice_editor()

    # ---------------------- Rendering ----------------------
    def _render_practice_editor(self):
        for child in self.inner.winfo_children():
            child.destroy()
        self.item_widgets.clear()

        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)
        title = self._strip_md(lesson.get('lesson_title', f'Lesson {self.current_lesson_num}'))
        header = ttk.Label(self.inner, text=f'Lesson {self.current_lesson_num}: {title}', font=('Segoe UI', 14, 'bold'))
        header.pack(anchor='w', padx=12, pady=(10, 6))

        items = lesson.get('practice', None)
        if not isinstance(items, list) or len(items) == 0:
            ttk.Label(self.inner, text='No practice entries for this lesson', foreground='red').pack(anchor='w', padx=12, pady=8)
            # still allow adding via the top button
            return

        for idx, item in enumerate(items, start=1):
            lf = ttk.LabelFrame(self.inner, text=f"Practice {idx}")
            lf.pack(fill='x', padx=12, pady=8, ipadx=6, ipady=6)

            # Action bar
            btnbar = ttk.Frame(lf)
            btnbar.pack(fill='x', pady=(0, 4))
            ttk.Button(btnbar, text='Delete', command=lambda i_del=idx-1: self._delete_item(i_del)).pack(side='right')

            # Prompt
            ttk.Label(lf, text='Prompt:').pack(anchor='w')
            p_text = tk.Text(lf, height=3, wrap='word')
            p_text.pack(fill='x', padx=4, pady=(0, 6))
            p_text.insert('1.0', str(item.get('prompt', '') or ''))

            # Answer
            ttk.Label(lf, text='Answer:').pack(anchor='w')
            a_text = tk.Text(lf, height=2, wrap='word')
            a_text.pack(fill='x', padx=4, pady=(0, 2))
            a_text.insert('1.0', str(item.get('answer', '') or ''))

            def mark_dirty(event, self=self):
                self.unsaved_changes = True
            p_text.bind('<KeyRelease>', mark_dirty)
            a_text.bind('<KeyRelease>', mark_dirty)

            self.item_widgets.append({'prompt': p_text, 'answer': a_text})

        ttk.Label(self.inner, text='').pack(pady=10)

    # ---------------------- Actions ----------------------
    def _add_item(self):
        if self.current_lesson_num is None:
            return
        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)
        items = lesson.get('practice')
        if not isinstance(items, list):
            items = []
            lesson['practice'] = items
        items.append({'prompt': '', 'answer': ''})
        self.unsaved_changes = True
        self._render_practice_editor()
        self.after(50, lambda: self.canvas.yview_moveto(1.0))

    def _delete_item(self, index: int):
        if self.current_lesson_num is None:
            return
        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)
        items = lesson.get('practice', [])
        if not isinstance(items, list) or not (0 <= index < len(items)):
            return
        if not messagebox.askyesno('Delete practice item', f'Delete practice item {index + 1}?'):
            return
        del items[index]
        self.unsaved_changes = True
        self._render_practice_editor()

    def _reload_current_from_disk(self):
        if self.current_lesson_num is None:
            return
        if self.unsaved_changes and not messagebox.askyesno('Unsaved changes', 'Discard changes and reload from disk?'):
            return
        fi, li = self.index_map[self.current_lesson_num]
        record = self.file_records[fi]
        try:
            with record['path'].open('r', encoding='utf-8') as f:
                record['data'] = json.load(f)
        except Exception as e:
            messagebox.showerror('Reload failed', f'Could not reload file: {e}')
            return
        self.unsaved_changes = False
        self._render_practice_editor()

    def _save(self):
        if self.current_lesson_num is None:
            return
        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)
        items = lesson.get('practice', None)
        if not isinstance(items, list):
            # Nothing to save
            messagebox.showerror('Save failed', 'No practice entries for this lesson')
            return

        # Sync edits back into data
        for i, widgets in enumerate(self.item_widgets):
            if i >= len(items):
                continue
            item = items[i]
            prompt_val = widgets['prompt'].get('1.0', 'end-1c').strip()
            answer_val = widgets['answer'].get('1.0', 'end-1c').strip()
            item['prompt'] = prompt_val
            item['answer'] = answer_val

        # Backup
        src = record['path']
        ts = datetime.now().strftime('%Y%m%d-%H%M%S')
        backup_path = self.backup_dir / f"{src.stem}_{ts}.json"
        try:
            backup_path.write_bytes(src.read_bytes())
        except Exception as e:
            messagebox.showerror('Backup failed', f'Could not create backup copy:\n{backup_path}\n\nError: {e}')
            return

        # Write
        try:
            with src.open('w', encoding='utf-8') as f:
                json.dump(record['data'], f, ensure_ascii=False, indent=2)
            self.unsaved_changes = False
            messagebox.showinfo('Saved', f"Saved to {src.name}\nBackup: backups/{backup_path.name}")
        except Exception as e:
            messagebox.showerror('Save failed', f'Could not write file: {e}')

    def _on_quit(self):
        if self.unsaved_changes:
            if not messagebox.askyesno('Unsaved changes', 'You have unsaved changes. Quit anyway?'):
                return
        self.destroy()


if __name__ == '__main__':
    app = PracticeEditorApp()
    app.mainloop()
