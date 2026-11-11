"use client";

import { useState } from "react";
import { HardHat, Truck } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { formatBdt, SERVICE_COPY as copy } from "@/lib/i18n";
import { crewSpecialties, serviceDistricts, transportEstimate, vehicleTypes } from "@/lib/service-directory";
import type { CrewSpecialty, DirectoryVehicleType, ServiceDirectory, ServiceDistrict } from "@/lib/service-directory";

const field = "flex flex-col gap-1.5 text-sm font-semibold text-secondary";
const input = "w-full min-h-11 rounded border border-hairline bg-surface px-3 py-2 text-ink";
const card = "min-w-0 rounded-lg border border-hairline bg-surface p-5 space-y-3";

export function ServiceDirectoryContent({ directory }: { directory: ServiceDirectory }) {
  const { locale } = useApp();
  const [district, setDistrict] = useState<ServiceDistrict>("Dhaka");
  const [specialty, setSpecialty] = useState<CrewSpecialty | "">("");
  const [rateUnit, setRateUnit] = useState<"DAY" | "SQFT" | "">("");
  const [maxRate, setMaxRate] = useState("");
  const [minProjects, setMinProjects] = useState("");
  const [vehicle, setVehicle] = useState<DirectoryVehicleType | "">("");
  const [distance, setDistance] = useState("10");

  const crews = directory.crews.filter((crew) =>
    crew.districts.includes(district) &&
    (!specialty || crew.specialties.includes(specialty)) &&
    (!rateUnit || crew.rateUnit === rateUnit) &&
    (!maxRate || crew.rateBdt <= Number(maxRate)) &&
    (!minProjects || crew.completedProjects >= Number(minProjects))
  );
  const transport = directory.transport.filter((provider) =>
    provider.districts.includes(district) && (!vehicle || provider.vehicleType === vehicle)
  );
  const km = Number(distance);
  const validDistance = distance !== "" && Number.isFinite(km) && km >= 0 && km <= 2000;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className={card}>
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{copy.title[locale]}</h1>
        <p className="text-secondary">{copy.intro[locale]}</p>
        <label className={`${field} max-w-xs`}>
          {copy.district[locale]}
          <select className={input} value={district} onChange={(event) => setDistrict(event.target.value as ServiceDistrict)}>
            {serviceDistricts.map((item) => <option key={item} value={item}>{copy.districts[item][locale]}</option>)}
          </select>
        </label>
      </div>
      <>
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink"><HardHat aria-hidden="true" className="size-5 text-accent" />{copy.crews[locale]}</h2>
            <div className="grid gap-3 rounded-lg bg-muted p-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className={field}>{copy.specialty[locale]}
                <select className={input} value={specialty} onChange={(event) => setSpecialty(event.target.value as CrewSpecialty | "")}>
                  <option value="">{copy.any[locale]}</option>
                  {crewSpecialties.map((item) => <option key={item} value={item}>{copy.specialties[item][locale]}</option>)}
                </select>
              </label>
              <label className={field}>{copy.rateUnit[locale]}
                <select className={input} value={rateUnit} onChange={(event) => setRateUnit(event.target.value as typeof rateUnit)}>
                  <option value="">{copy.any[locale]}</option>
                  <option value="DAY">{copy.day[locale]}</option>
                  <option value="SQFT">{copy.sqft[locale]}</option>
                </select>
              </label>
              <label className={field}>{copy.maxRate[locale]}
                <input className={input} type="number" min="0" value={maxRate} onChange={(event) => setMaxRate(event.target.value)} />
              </label>
              <label className={field}>{copy.minProjects[locale]}
                <input className={input} type="number" min="0" value={minProjects} onChange={(event) => setMinProjects(event.target.value)} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {crews?.length ? crews.map((crew) => (
                <article key={crew.id} className={card}>
                  <span className="rounded bg-muted px-2 py-1 text-sm font-semibold text-secondary">{(crew.demo ? copy.demo : copy.verified)[locale]}</span>
                  <h3 className="text-lg font-bold text-ink">{locale === "bn" ? crew.nameBn : crew.nameEn}</h3>
                  <p className="text-secondary">{crew.specialties.map((item) => copy.specialties[item][locale]).join(", ")}</p>
                  <p className="font-semibold text-ink">{formatBdt(crew.rateBdt, locale)} {copy[crew.rateUnit === "DAY" ? "day" : "sqft"][locale]}</p>
                  <p className="text-secondary">{copy.projects[locale]}: {crew.completedProjects.toLocaleString(locale === "bn" ? "bn-BD" : "en-BD")}</p>
                </article>
              )) : <p className="text-secondary" role="status">{copy.empty[locale]}</p>}
            </div>
          </section>
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink"><Truck aria-hidden="true" className="size-5 text-accent" />{copy.transport[locale]}</h2>
            <div className="grid gap-3 rounded-lg bg-muted p-4 sm:grid-cols-2">
              <label className={field}>{copy.vehicle[locale]}
                <select className={input} value={vehicle} onChange={(event) => setVehicle(event.target.value as DirectoryVehicleType | "")}>
                  <option value="">{copy.any[locale]}</option>
                  {vehicleTypes.map((item) => <option key={item} value={item}>{copy.vehicles[item][locale]}</option>)}
                </select>
              </label>
              <label className={field}>{copy.distance[locale]}
                <input className={input} aria-describedby="transport-formula" type="number" min="0" max="2000" step="0.1" value={distance} onChange={(event) => setDistance(event.target.value)} />
              </label>
              <p id="transport-formula" className="text-sm text-secondary sm:col-span-2">{copy.formula[locale]}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {transport?.length ? transport.map((provider) => {
                const rate = provider.rates[district];
                if (!rate) return null;
                return (
                  <article key={provider.id} className={card}>
                    <span className="rounded bg-muted px-2 py-1 text-sm font-semibold text-secondary">{(provider.demo ? copy.demo : copy.verified)[locale]}</span>
                    <h3 className="text-lg font-bold text-ink">{copy.vehicles[provider.vehicleType][locale]}</h3>
                    <p className="text-secondary">{locale === "bn" ? provider.nameBn : provider.nameEn}</p>
                    <dl className="space-y-1 text-sm text-secondary">
                      <div className="flex flex-wrap justify-between gap-2"><dt>{copy.base[locale]}</dt><dd>{formatBdt(rate.baseBdt, locale)}</dd></div>
                      <div className="flex flex-wrap justify-between gap-2"><dt>{copy.perKm[locale]}</dt><dd>{formatBdt(rate.perKmBdt, locale)}</dd></div>
                      <div className="flex flex-wrap justify-between gap-2 border-t border-hairline pt-2 font-semibold text-ink">
                        <dt>{copy.estimate[locale]}</dt>
                        <dd data-testid={`fare-${provider.id}`}>{validDistance ? formatBdt(transportEstimate(rate, km), locale) : copy.unassigned[locale]}</dd>
                      </div>
                    </dl>
                  </article>
                );
              }) : <p className="text-secondary" role="status">{copy.empty[locale]}</p>}
            </div>
          </section>
      </>
    </div>
  );
}
