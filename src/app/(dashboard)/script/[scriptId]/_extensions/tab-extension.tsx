import { Extension } from '@tiptap/core';

const TabExtension = Extension.create({
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        this.editor.commands.insertContent('    '); // 4 spaces
        return true;
      },
      'Shift-Tab': () => {
        // Remove 4 spaces if at start of line
        const { state, dispatch } = this.editor.view;
        const { tr, selection } = state;
        const { $from } = selection;

        if (state.doc.textBetween($from.before(), $from.pos).startsWith('    ')) {
          tr.delete($from.before(), $from.before() + 4);
          dispatch(tr);
          return true;
        }
        return false;
      },
    };
  },
});

export default TabExtension