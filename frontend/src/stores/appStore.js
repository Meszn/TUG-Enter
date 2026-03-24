import { create } from "zustand";

export const useAppStore = create((set) => ({
  phase: "starmap",
  setPhase: (phase) => set({ phase }),

  isVaultOpen: false,
  setVaultOpen: (open) => set({ isVaultOpen: open }),

  form: {
    projectName: "",
    purpose: "",
    researchers: [""],
    startDate: "",
  },
  setForm: (u) => set((s) => ({ form: { ...s.form, ...u } })),
  resetForm: () => set({
    form: { projectName:"", purpose:"", researchers:[""], startDate:"" },
    capturedImage: null,
    capturedImages: [],
  }),

  // Araştırmacı yönetimi
  addResearcher:    ()    => set((s) => ({ form: { ...s.form, researchers: [...s.form.researchers, ""] } })),
  removeResearcher: (i)   => set((s) => ({ form: { ...s.form, researchers: s.form.researchers.filter((_,j) => j!==i) } })),
  updateResearcher: (i,v) => set((s) => {
    const arr = [...s.form.researchers];
    arr[i] = v;
    return { form: { ...s.form, researchers: arr } };
  }),

  capturedImage: null,
  setCapturedImage: (img) => set({ capturedImage: img }),
  
  capturedImages: [],
  addCapturedImage: (img) => set((s) => ({ capturedImages: [...s.capturedImages, img].slice(0, 4) })),
  removeCapturedImage: (idx) => set((s) => ({ capturedImages: s.capturedImages.filter((_, i) => i !== idx) })),
  clearCapturedImages: () => set({ capturedImages: [] }),

  selectedProject: null,
  setSelectedProject: (p) => set({ selectedProject: p }),

  projects: [],
  setProjects: (list) => set({ projects: list }),
  addProject:  (p)    => set((s) => ({ projects: [p, ...s.projects] })),

  dyingStars: [],
  addDyingStar:    (p) => set((s) => ({ dyingStars: [...s.dyingStars, p] })),
  removeDyingStar: (id) => set((s) => ({ dyingStars: s.dyingStars.filter(d => d.id !== id) })),

  shakeSignal: 0,
  triggerShake: () => set((s) => ({ shakeSignal: s.shakeSignal + 1 })),

  error: "",
  setError: (msg) => {
    set({ error: msg });
    setTimeout(() => set({ error: "" }), 4000);
  },
}));