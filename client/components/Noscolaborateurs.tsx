import { Button } from "@/components/ui/button";
import Link from "next/link";
import GSAPWrapper from "@/components/GSAPWrapper"; // Import GSAPWrapper

export default function Example() {
  return (
    <div className="bg-white sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2">
          {/* Left Section (Text Content) */}
          <GSAPWrapper animationType="fadeIn" delay={0.2} duration={1}>
            <div className="mx-auto w-full max-w-xl lg:mx-0">
              <h2 className="text-3xl font-bold tracking-tight text-[#042e62]">
                Projet Coopérative FSBM - UH2C
              </h2>
              <p className="mt-6 text-lg text-justify font-sans leading-8 text-gray-600">
                Le projet coopératif de la Faculté des Sciences Ben M'Sick (UH2C)
                est une initiative innovante visant à rapprocher le monde académique
                et le secteur socio-économique. Cette plateforme collaborative favorise
                l'émergence de projets concrets, le transfert de connaissances et la
                création de synergies entre chercheurs, étudiants et professionnels.
              </p>
              <div className="mt-12 flex flex-col lg:flex-row gap-y-4 items-center gap-x-6">
                <Button
                  className="rounded-md bg-[#cbac70] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#042e62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <Link href="/login">Lancez-vous dès maintenant</Link>
                </Button>
                <Link
                  href="/about"
                  className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-300"
                >
                  Voir Plus <span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </GSAPWrapper>

          {/* Right Section (Single Centered Logo with Hover Effect) */}
          <GSAPWrapper animationType="slideRight" delay={0.4} duration={1}>
            <div className="lg:flex lg:justify-center hidden">
              <div className="relative group">
                {/* Image with Vibrant Hover Effect */}
                <img
                  className="relative z-10 object-contain w-full h-auto  
                    transition-all duration-300 
                    group-hover:scale-105 group-hover:brightness-125"
                  src="/logo-fsbm.png"
                  alt="FSBM"
                  width={405}
                  height={48}
                />
              </div>
            </div>
          </GSAPWrapper>
        </div>
      </div>
    </div>
  );
}