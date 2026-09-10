export function EqBars({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4 w-4 mx-auto">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] bg-accent rounded-full"
          style={{
            height: '100%',
            animation: playing ? `eq 0.9s ease-in-out ${i * 0.15}s infinite` : 'none',
            transform: playing ? undefined : 'scaleY(0.3)',
          }}
        />
      ))}
      <style>{`
        @keyframes eq {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
