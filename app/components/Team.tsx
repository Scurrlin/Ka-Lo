"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type MemberId = "sean" | "kalo" | "nate" | "murphy";

type TeamMember = {
  id: MemberId;
  name: string;
  height: string;
  image: string;
  imageHeight: number;
  imageWidth: number;
  imageClass: string;
  bio: string;
};

// All-caps display name with the Lambda character swapped in for every "A" (e.g. "Sean" -> "SEΛN").
function getDisplayName(name: string) {
  return name.toUpperCase().replace(/A/g, "Λ");
}

const teamMembers: TeamMember[] = [
  {
    id: "kalo",
    name: "Kalo",
    height: "5'10",
    image: "/team/generated/kalo.png",
    imageHeight: 1825,
    imageWidth: 862,
    imageClass: "h-[88%]",
    bio: "Cras vehicula, mi eget laoreet gravida, nibh arcu fermentum arcu, vitae porttitor nisl massa at magna."
  },
  {
    id: "sean",
    name: "Sean",
    height: "6'2",
    image: "/team/generated/sean.png",
    imageHeight: 1828,
    imageWidth: 860,
    imageClass: "h-[95%]",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum."
  },
  {
    id: "nate",
    name: "Nate",
    height: "5'10",
    image: "/team/generated/nate.png",
    imageHeight: 1821,
    imageWidth: 864,
    imageClass: "h-[88%]",
    bio: "Aliquam erat volutpat. Integer posuere erat a ante venenatis dapibus posuere velit aliquet."
  },
  {
    id: "murphy",
    name: "LeBlanc",
    height: "6'2",
    image: "/team/generated/murphy.png",
    imageHeight: 1824,
    imageWidth: 862,
    imageClass: "h-[95%]",
    bio: "Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui."
  }
];

export default function Team() {
  const [selectedMember, setSelectedMember] = useState<MemberId | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const content = contentRef.current;
    const grid = gridRef.current;

    if (!section || !content || !grid) {
      return;
    }

    const ctx = gsap.context(() => {
      // Triggered off the grid itself (not the whole content block) so the cards start
      // revealing as soon as they arrive underneath "Meet The Team" - right as the grid
      // enters from the bottom of the screen, not after an extra scroll delay.
      gsap.from(".team-member-card", {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: grid,
          start: "top 90%"
        },
        stagger: 0.1,
        y: 60
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Clicking anywhere outside the currently selected member's card (including a different
  // card, which just swaps the selection) dismisses the overlay.
  useEffect(() => {
    if (!selectedMember) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".member-button")) {
        setSelectedMember(null);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [selectedMember]);

  return (
    <section ref={sectionRef} id="team" className="relative bg-black text-white">
      <div ref={contentRef} className="mx-auto max-w-7xl px-5 pb-16 pt-0 sm:px-8 md:pb-20">
        <div ref={gridRef} className="grid grid-cols-1 gap-x-4 gap-y-9 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
          {teamMembers.map((member) => {
            const isSelected = selectedMember === member.id;

            return (
              <div key={member.id} className="team-member-card">
                <p className="mb-3 text-center font-display text-2xl uppercase tracking-wide text-white sm:text-3xl md:text-4xl">
                  {getDisplayName(member.name)}
                </p>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={member.name}
                  onClick={() => setSelectedMember(isSelected ? null : member.id)}
                  className={`member-button group relative flex aspect-[7/10] w-full items-end justify-center overflow-hidden rounded-md border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.015))] px-2 pt-4 transition duration-500 ${
                    isSelected ? "border-white/70 bg-white/[0.08]" : "hover:border-white/35"
                  }`}
                >
                  <span className="absolute bottom-5 h-14 w-4/5 rounded-[50%] bg-black blur-xl" aria-hidden="true" />
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={member.imageWidth}
                    height={member.imageHeight}
                    className={`member-shadow relative z-10 w-full object-contain object-bottom transition duration-500 ${member.imageClass} ${
                      isSelected ? "scale-[1.035]" : "group-hover:scale-[1.02]"
                    }`}
                  />
                  {/* Mirrors the name/bio that used to live in the block below the grid,
                      now shown directly over the selected card instead. */}
                  <div
                    className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/85 p-5 text-center backdrop-blur-sm transition duration-500 pointer-events-none ${
                      isSelected ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <p className="text-sm font-bold uppercase text-[#d7d7d0]">{member.name}</p>
                    <p className="text-sm leading-6 text-neutral-200">{member.bio}</p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
