import { Container } from "../components/Container";

export const NotFound = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-black">
      {/* Blurred background */}
      <div className="absolute inset-0 scale-110 bg-[url('https://images.unsplash.com/photo-1605319658414-6129584c2178')] bg-cover bg-center blur-2xl" />

      <Container className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-12 md:flex-row">
          {/* Masked 404 */}
          <h1
  className="animate-[var(--animate-float)]
             text-[160px] sm:text-[220px] md:text-[320px]
             font-extrabold leading-none
             bg-[url('https://images.unsplash.com/photo-1605319658414-6129584c2178')]
             bg-cover bg-center
             bg-clip-text text-transparent"
>
  404
</h1>

          {/* Kangaroo + bubble */}
          <div className="relative flex flex-col items-center">
            {/* Speech bubble (kept + animated) */}
            <div
  className="animate-[var(--animate-bubble)]
             relative mb-4 rounded-2xl bg-white/90 px-6 py-4
             text-neutral-800 shadow-xl
             dark:bg-black/80 dark:text-white"
>
  <p className="text-lg font-semibold">
    Hey… you’re lost in the URL 🧭
  </p>

              {/* Bubble tail */}
              <div className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 bg-white/90 dark:bg-black/80" />
            </div>

            {/* Kangaroo */}
            <img
              src="/lost.webp"
              alt="Lost kangaroo"
              className="animate-[var(--animate-hop)]
             h-40 w-40 rounded-full object-cover shadow-xl"
            />

            {/* CTA */}
            <button
              onClick={() => (window.location.href = "/")}
              className="mt-6 rounded-md bg-linear-to-b from-white/5 to-black/5 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-black cursor-pointer"
            >
              Take me home →
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};
