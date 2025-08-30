# Socratic Xhosa - Local Lesson Editor (Tkinter)
# Run: python tools/lesson_editor.py

import json
from pathlib import Path
from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox

DATA_FILES_ORDER = [
    'part1.json',          # 1–10
    'part2.json',         # 11–25
    'part3.json',         # 26–30
    'part4.json',         # 31–35
    'part5.json',         # 36–40
    'part6.json',         # 41–45
]

class LessonEditorApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title('Socratic Xhosa: Lesson Editor (Local)')
        self.geometry('1100x750')

        # Paths
        self.root_dir: Path = Path(__file__).resolve().parent
        # Now that the script lives in tools/, JSON lives one level up in public/data
        self.data_dir: Path = self.root_dir.parent / 'public' / 'data' / 'lesson_data'
        self.backup_dir: Path = self.data_dir / 'backups'
        self.backup_dir.mkdir(parents=True, exist_ok=True)

        # Data containers
        # file_records: list of { 'path': Path, 'data': dict }
        self.file_records = []
        # index_map: global_lesson_number -> (file_idx, local_idx)
        self.index_map = {}
        # lesson_options: list of display strings e.g. "1: Lesson title"
        self.lesson_options = []

        # State
        self.current_lesson_num = None
        self.unsaved_changes = False
        self.turn_widgets = []  # list of { 'teacher': Text, 'student': Text, 'turn_ref': dict }

        # Load data
        self._load_all_files()

        # Build UI
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
        # Minimal markdown cleanup for titles
        return text.replace('**', '').strip()

    def _get_lesson_by_number(self, lesson_num: int):
        fi, li = self.index_map[lesson_num]
        record = self.file_records[fi]
        lesson = record['data']['lessons'][li]
        return record, lesson, fi, li

    # ---------------------- UI Construction ----------------------
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

        # Add/Remove controls
        ttk.Button(top, text='Add teacher turn', command=lambda: self._add_turn('teacher')).pack(side='left', padx=6)
        ttk.Button(top, text='Add student turn', command=lambda: self._add_turn('student')).pack(side='left')

        # Info label
        self.info_var = tk.StringVar(value=str(self.data_dir))
        info = ttk.Label(top, textvariable=self.info_var, foreground='#666')
        info.pack(side='right')

    def _build_scrollable_editor(self):
        # Scrollable area using Canvas + inner Frame
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

        # Mouse wheel scrolling
        self.canvas.bind_all('<MouseWheel>', self._on_mousewheel)        # Windows
        self.canvas.bind_all('<Button-4>', self._on_mousewheel_linux)    # Linux up
        self.canvas.bind_all('<Button-5>', self._on_mousewheel_linux)    # Linux down

    def _on_canvas_configure(self, event):
        # Stretch inner frame to canvas width
        self.canvas.itemconfig(self.canvas_window, width=event.width)

    def _on_mousewheel(self, event):
        # Windows/Mac delta
        delta = int(-1 * (event.delta / 120))
        self.canvas.yview_scroll(delta, 'units')

    def _on_mousewheel_linux(self, event):
        if event.num == 4:
            self.canvas.yview_scroll(-1, 'units')
        elif event.num == 5:
            self.canvas.yview_scroll(1, 'units')

    # ---------------------- Lesson Rendering ----------------------
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
                # revert selection
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
        self._render_lesson_editor()

    def _render_lesson_editor(self):
        # Clear previous widgets
        for child in self.inner.winfo_children():
            child.destroy()
        self.turn_widgets.clear()

        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)

        title = self._strip_md(lesson.get('lesson_title', f'Lesson {self.current_lesson_num}'))
        header = ttk.Label(self.inner, text=f'Lesson {self.current_lesson_num}: {title}', font=('Segoe UI', 14, 'bold'))
        header.pack(anchor='w', padx=12, pady=(10, 6))

        turns = lesson.get('turns', [])
        if not isinstance(turns, list) or not turns:
            ttk.Label(self.inner, text='No turns found in this lesson.', foreground='red').pack(anchor='w', padx=12, pady=8)
            return

        for idx, turn in enumerate(turns, start=1):
            turn_num = turn.get('turn_number', idx)
            section = str(turn.get('section', '') or '')
            lf = ttk.LabelFrame(self.inner, text=f"Turn {turn_num} - {section}")
            lf.pack(fill='x', padx=12, pady=8, ipadx=6, ipady=6)

            # Per-turn action bar
            btnbar = ttk.Frame(lf)
            btnbar.pack(fill='x', padx=0, pady=(0, 4))
            ttk.Button(btnbar, text='Delete turn', command=lambda i_del=idx-1: self._delete_turn(i_del)).pack(side='right')
            ttk.Button(btnbar, text='Insert below', command=lambda i_ins=idx-1: self._insert_turn(i_ins, 'below')).pack(side='right', padx=(0, 4))
            ttk.Button(btnbar, text='Insert above', command=lambda i_ins=idx-1: self._insert_turn(i_ins, 'above')).pack(side='right', padx=(0, 4))

            # Section (turn name)
            ttk.Label(lf, text='Section (turn name):').pack(anchor='w')
            sec_var = tk.StringVar(value=section)
            sec_entry = ttk.Entry(lf, textvariable=sec_var)
            sec_entry.pack(fill='x', padx=4, pady=(0, 6))

            def on_sec_change(*args, lf=lf, tn=turn_num, var=sec_var, self=self):
                self.unsaved_changes = True
                lf.configure(text=f"Turn {tn} - {var.get()}")
            sec_var.trace_add('write', on_sec_change)

            # Determine which dialogue(s) are present in this turn
            teacher_present = 'teacher_dialogue' in turn
            student_present = 'student_dialogue' in turn

            t_text = None
            s_text = None

            if teacher_present:
                ttk.Label(lf, text='Teacher dialogue:').pack(anchor='w')
                t_text = tk.Text(lf, height=5, wrap='word')
                t_text.pack(fill='x', padx=4, pady=(0, 6))
                t_text.insert('1.0', str(turn.get('teacher_dialogue', '') or ''))

            if student_present:
                ttk.Label(lf, text='Student dialogue:').pack(anchor='w')
                s_text = tk.Text(lf, height=3, wrap='word')
                s_text.pack(fill='x', padx=4, pady=(0, 2))
                s_text.insert('1.0', str(turn.get('student_dialogue', '') or ''))

            if not teacher_present and not student_present:
                ttk.Label(lf, text='No dialogue in this turn.', foreground='#777').pack(anchor='w', padx=4)

            # mark dirty on edits
            def mark_dirty(event, self=self):
                self.unsaved_changes = True
            if t_text is not None:
                t_text.bind('<KeyRelease>', mark_dirty)
            if s_text is not None:
                s_text.bind('<KeyRelease>', mark_dirty)

            self.turn_widgets.append({'teacher': t_text, 'student': s_text, 'section_var': sec_var, 'turn_ref': turn})

        ttk.Label(self.inner, text='').pack(pady=10)

    def _renumber_turns(self, turns):
        for i, t in enumerate(turns, start=1):
            t['turn_number'] = i

    def _add_turn(self, speaker: str):
        if self.current_lesson_num is None:
            return
        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)
        turns = lesson.get('turns')
        if not isinstance(turns, list):
            turns = []
            lesson['turns'] = turns
        # New empty turn for chosen speaker
        new_turn = {'turn_number': len(turns) + 1, 'section': ''}
        if speaker == 'teacher':
            new_turn['teacher_dialogue'] = ''
        else:
            new_turn['student_dialogue'] = ''
        turns.append(new_turn)
        self._renumber_turns(turns)
        self.unsaved_changes = True
        self._render_lesson_editor()
        # Scroll to bottom to reveal the new turn
        self.after(50, lambda: self.canvas.yview_moveto(1.0))

    def _insert_turn(self, index: int, position: str):
        if self.current_lesson_num is None:
            return
        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)
        turns = lesson.get('turns', [])
        if not isinstance(turns, list) or not (0 <= index < len(turns)):
            return
        insert_at = index if position == 'above' else index + 1
        # Choose speaker matching the reference turn
        ref_turn = turns[index]
        if 'teacher_dialogue' in ref_turn:
            speaker = 'teacher'
        elif 'student_dialogue' in ref_turn:
            speaker = 'student'
        else:
            speaker = 'teacher'
        new_turn = {'turn_number': 0, 'section': ''}
        if speaker == 'teacher':
            new_turn['teacher_dialogue'] = ''
        else:
            new_turn['student_dialogue'] = ''
        turns.insert(insert_at, new_turn)
        self._renumber_turns(turns)
        self.unsaved_changes = True
        self._render_lesson_editor()
        # Scroll near the inserted turn position
        total = max(1, len(turns))
        frac = min(1.0, max(0.0, insert_at / total))
        self.after(50, lambda: self.canvas.yview_moveto(frac))

    def _delete_turn(self, index: int):
        if self.current_lesson_num is None:
            return
        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)
        turns = lesson.get('turns', [])
        if not isinstance(turns, list) or not (0 <= index < len(turns)):
            return
        if not messagebox.askyesno('Delete turn', f'Delete turn {index + 1}?'):
            return
        del turns[index]
        self._renumber_turns(turns)
        self.unsaved_changes = True
        self._render_lesson_editor()

    # ---------------------- Save/Reload/Exit ----------------------
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
        self._render_lesson_editor()

    def _save(self):
        if self.current_lesson_num is None:
            return

        record, lesson, fi, li = self._get_lesson_by_number(self.current_lesson_num)
        turns = lesson.get('turns', [])
        if not isinstance(turns, list):
            messagebox.showerror('Save failed', 'Turns structure is not a list.')
            return

        # Apply edits into in-memory data
        for i, widgets in enumerate(self.turn_widgets):
            if i >= len(turns):
                continue
            turn = turns[i]
            t_widget = widgets.get('teacher')
            s_widget = widgets.get('student')
            sec_var = widgets.get('section_var')

            if sec_var is not None:
                sec_val = sec_var.get().strip()
                if sec_val:
                    turn['section'] = sec_val
                else:
                    if 'section' in turn:
                        del turn['section']

            if t_widget is not None:
                teacher_val = t_widget.get('1.0', 'end-1c')
                if teacher_val.strip():
                    turn['teacher_dialogue'] = teacher_val
                else:
                    if 'teacher_dialogue' in turn:
                        del turn['teacher_dialogue']

            if s_widget is not None:
                student_val = s_widget.get('1.0', 'end-1c')
                if student_val.strip():
                    turn['student_dialogue'] = student_val
                else:
                    if 'student_dialogue' in turn:
                        del turn['student_dialogue']

        # Backup original file
        src = record['path']
        ts = datetime.now().strftime('%Y%m%d-%H%M%S')
        backup_path = self.backup_dir / f"{src.stem}_{ts}.json"
        try:
            backup_path.write_bytes(src.read_bytes())
        except Exception as e:
            messagebox.showerror('Backup failed', f'Could not create backup copy:\n{backup_path}\n\nError: {e}')
            return

        # Save updated JSON
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
    app = LessonEditorApp()
    app.mainloop()
