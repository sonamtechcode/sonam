import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useHospital = create(
  persist(
    (set) => ({
      selectedHospital: null,
      setSelectedHospital: (hospital) => set({ selectedHospital: hospital }),
    }),
    {
      name: 'hospital-storage',
    }
  )
)
