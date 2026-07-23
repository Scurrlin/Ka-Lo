export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white px-5 py-10 text-black sm:px-8">
      <div className="mx-auto flex max-w-7xl justify-center">
        <p className="text-xl tracking-wide sm:text-2xl">
          &copy; {year} SEΛN X KΛLO
        </p>
      </div>
    </footer>
  );
}
