export default function IconButton({ onClick, icon: Icon, title, hasBorder }) {
  return (
    <button
      onClick={onClick}
      className={`text-purple-100 p-1.5 sm:p-2 hover:bg-purple-500 rounded transition-colors shrink-0 ${hasBorder ? 'border border-violet-400' : ''}`}
      title={title}
    >
      <Icon />
    </button>
  );
}