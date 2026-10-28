interface Window {
  studioSaved: (dialog?: HTMLDialogElement | null) => void;
  studioSavedReload: () => void;
  studioRichField: (parent: ParentNode, options: { name: string; max: number; html: string }) => void;
  studioPaintRich: (node: HTMLElement, html: string) => void;
}
