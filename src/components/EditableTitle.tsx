"use client";

import { useState, useEffect } from "react";

interface EditableTitleProps {
  name: string;
  onSave: (value: string) => void;
  saving: boolean;
}

export function EditableTitle({ name, onSave, saving }: EditableTitleProps) {
  const [value, setValue] = useState(name);

  useEffect(() => {
    setValue(name);
  }, [name]);

  const handleBlur = () => {
    onSave(value);
  };

  return (
    <div className="flex items-center gap-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        className="text-2xl font-semibold bg-transparent border-b border-transparent focus:border-indigo-300 outline-none"
      />
      {saving && <span className="text-sm text-slate-500">Сохраняем...</span>}
    </div>
  );
}
