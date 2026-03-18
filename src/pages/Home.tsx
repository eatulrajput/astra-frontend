import { motion } from "motion/react";

import {
  AnimatedTestimonials,
  Cover,
  Timeline,
  WobbleCard,
  Contact,
} from "@/components/ui";
import { changelogData } from "@/data/changelogData";
import { testimonialsData } from "@/data/testimonialsData";

export const Home = () => {
  return (
    <div>
      <div>
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-8 bg-linear-to-br from-slate-700 to-slate-500 bg-clip-text py-20 text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl dark:from-slate-300 dark:to-slate-500"
        >
          Hi, I am Astra <br /> Welcome Home.
        </motion.h1>
      </div>
      <div>
        <img src="/illustrations/studying.svg" alt="" />
      </div>

      <div className="mx-auto mt-80 flex flex-col items-center justify-evenly">
        <h1 className="relative z-20 mx-auto max-w-7xl bg-linear-to-b from-emerald-400 via-emerald-400 to-emerald-400 bg-clip-text text-center text-4xl font-semibold text-transparent md:text-4xl lg:text-6xl dark:from-white dark:via-white dark:to-white">
          You are engaging with a Strong AI Based Community Platform <br /> at{" "}
          <Cover>Astra</Cover>
        </h1>
      </div>

      <div className="min-h-screen">
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mx-auto mt-20 flex min-h-[50vh] items-center justify-center bg-linear-to-br from-slate-700 to-slate-500 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl dark:from-slate-300 dark:to-slate-500"
        >
          <p className="text-4xl">Features</p>
        </motion.h1>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-3">
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
            className=""
          >
            <div className="max-w-xs">
              <h2 className="text-left text-base font-semibold tracking-[-0.015em] text-balance text-white md:text-xl lg:text-3xl">
                Astra AI helps you in getting the right information.
              </h2>
              <p className="mt-4 text-left text-base/6 text-neutral-200">
                Join the Community Now!
              </p>
            </div>
            <img
              src="/astra.webp"
              width={500}
              height={500}
              alt="Astra Demo Image"
              className="absolute -right-4 -bottom-10 rounded-2xl object-contain grayscale filter lg:-right-5"
            />
          </WobbleCard>
          <WobbleCard containerClassName="col-span-1 min-h-[300px]">
            <h2 className="max-w-80 text-left text-base font-semibold tracking-[-0.015em] text-balance text-white md:text-xl lg:text-3xl">
              No need to use Ask Seniors Anymore.
            </h2>
            <p className="mt-4 max-w-104 text-left text-base/6 text-neutral-200">
              Just Sign Up with College Email and Experience.
            </p>
          </WobbleCard>
          <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
            <div className="max-w-sm">
              <h2 className="max-w-sm text-left text-base font-semibold tracking-[-0.015em] text-balance text-white md:max-w-lg md:text-xl lg:text-3xl">
                Signup for free and Join Astra AI Community today!
              </h2>
              <p className="mt-4 max-w-104 text-left text-base/6 text-neutral-200">
                The One and Only Solution for Students and Professors.
              </p>
            </div>
            <img
              src="/astra.webp"
              width={500}
              height={500}
              alt="Astra Demo Image"
              className="absolute -right-10 -bottom-10 rounded-2xl object-contain md:-right-5 lg:-right-5"
            />
          </WobbleCard>
        </div>
      </div>

      {/* Work Timeline */}
      <div className="relative w-full overflow-clip">
        <Timeline data={changelogData} />
      </div>

      <div className="min-h-screen">
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mx-auto mt-20 flex min-h-[50vh] items-center justify-center bg-linear-to-br from-slate-700 to-slate-500 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl dark:from-slate-300 dark:to-slate-500"
        >
          <p className="text-4xl">Testimonials</p>
        </motion.h1>

        {/* Testimonials */}
        <AnimatedTestimonials testimonials={testimonialsData} />
      </div>

      {/* Contact */}
      <section id="contact">
        <Contact />
      </section>
    </div>
  );
};
