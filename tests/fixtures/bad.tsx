import Lenis from 'lenis';
export function Card() {
  return (
    <div onClick={() => open()} className="transition-all ease-in h-screen font-light outline-none">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ease: "easeIn" }} />
    </div>
  );
}
