"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CAR_MAX,
  DRIVER_NAME_MAX,
  validateDriverDetails,
  type DriverDetailsErrors,
} from "@/lib/driverPass";

interface GediPassDetailsFormProps {
  initialDriverName: string;
  initialCar: string;
  onSubmit: (driverName: string, car: string) => void;
  onCancel: () => void;
}

export default function GediPassDetailsForm({
  initialDriverName,
  initialCar,
  onSubmit,
  onCancel,
}: GediPassDetailsFormProps) {
  const [driverName, setDriverName] = useState(initialDriverName);
  const [car, setCar] = useState(initialCar);
  const [errors, setErrors] = useState<DriverDetailsErrors>({ driverName: null, car: null });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validateDriverDetails(driverName, car);
    setErrors(validation);
    if (validation.driverName || validation.car) return;
    onSubmit(driverName.trim(), car.trim());
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col items-center px-5 pb-6 sm:px-6">
      <p lang="pa" className="font-gurmukhi text-lg font-bold text-gedi-offwhite">
        ਆਪਣੀ ਗੇੜੀ ਬਣਾਓ
      </p>
      <p className="mt-1 text-xs font-bold tracking-[0.2em] text-gedi-amber">MAKE IT YOUR GEDI</p>
      <p className="mt-2 max-w-xs text-center text-xs leading-relaxed text-gedi-offwhite/60">
        Add the driver details before we print your pass.
      </p>

      <div className="mt-6 w-full">
        <label
          htmlFor="gedi-driver-name"
          className="block text-[10px] font-bold tracking-[0.15em] text-gedi-offwhite/60"
        >
          DRIVER NAME
        </label>
        <input
          ref={nameInputRef}
          id="gedi-driver-name"
          type="text"
          value={driverName}
          onChange={(event) => {
            setDriverName(event.target.value);
            if (errors.driverName) setErrors((prev) => ({ ...prev, driverName: null }));
          }}
          maxLength={DRIVER_NAME_MAX}
          required
          aria-invalid={errors.driverName ? "true" : "false"}
          aria-describedby={errors.driverName ? "gedi-driver-name-error" : undefined}
          placeholder="e.g. Hardeep"
          className="mt-1.5 min-h-11 w-full rounded-lg border border-gedi-offwhite/20 bg-black/30 px-3.5 text-sm text-gedi-offwhite placeholder:text-gedi-offwhite/30 focus:border-gedi-amber focus:outline-none"
        />
        {errors.driverName && (
          <p id="gedi-driver-name-error" role="alert" className="mt-1 text-xs text-red-400">
            {errors.driverName}
          </p>
        )}
      </div>

      <div className="mt-4 w-full">
        <label htmlFor="gedi-car" className="block text-[10px] font-bold tracking-[0.15em] text-gedi-offwhite/60">
          CAR — OPTIONAL
        </label>
        <input
          id="gedi-car"
          type="text"
          value={car}
          onChange={(event) => {
            setCar(event.target.value);
            if (errors.car) setErrors((prev) => ({ ...prev, car: null }));
          }}
          maxLength={CAR_MAX}
          aria-invalid={errors.car ? "true" : "false"}
          aria-describedby={errors.car ? "gedi-car-error" : undefined}
          placeholder="Leave blank for a Gedi pick"
          className="mt-1.5 min-h-11 w-full rounded-lg border border-gedi-offwhite/20 bg-black/30 px-3.5 text-sm text-gedi-offwhite placeholder:text-gedi-offwhite/30 focus:border-gedi-amber focus:outline-none"
        />
        {errors.car && (
          <p id="gedi-car-error" role="alert" className="mt-1 text-xs text-red-400">
            {errors.car}
          </p>
        )}
      </div>

      <div className="mt-6 flex w-full flex-col gap-2.5">
        <button
          type="submit"
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gedi-amber px-6 text-xs font-bold tracking-[0.18em] text-gedi-black transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          GENERATE GEDI PASS
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-1 min-h-[44px] w-full text-center text-[11px] font-semibold tracking-[0.18em] text-gedi-offwhite/50 transition-colors hover:text-gedi-offwhite"
        >
          NOT NOW
        </button>
      </div>
    </form>
  );
}
