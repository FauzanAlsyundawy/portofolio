export const personal = {
  name: "Fauzan Alsyundawy",
  title: "Junior Network Engineer / Infrastructure / Field Operations",
  availability: "Available for new opportunities",
  location: "Jakarta, Indonesia",
  experience: "1+ tahun",
  focus:
    "Fokus: dynamic routing, BGP multihoming, dan IPv4 engineering skala enterprise serta Membangun, mengamankan, dan mengoptimalkan infrastruktur jaringan serta administrasi server untuk konektivitas tanpa batas..",
  cvUrl: "/cv.pdf",
  email: "falsyundawy@gmail.com",
  serverEmail: "falsyundawy@mail.indocyber.my.id",
  whatsapp: "+621399823073",
  linkedin: "https://linkedin.com/in/fauzan-alsyundawy",
  github: "https://github.com/fauzan-alsyundawy",
  gitlab: "https://gitlab.com/fauzan-alsyundawy",
};

export const metrics = [
  {
    label: "SLA / Uptime Dikelola",
    value: "99.9%",
    icon: "Activity",
    suffix: "%",
  },
  {
    label: "Prefix / Blok IP Dikelola",
    value: "50+",
    icon: "Network",
    suffix: "",
  },
  {
    label: "Upstream & Peering",
    value: "6",
    icon: "Radio",
    suffix: "",
    detail: "4 Transit Link, 2 IXP Peering",
  },
  {
    label: "Insiden Ditangani",
    value: "200+",
    icon: "Timer",
    suffix: "",
    detail: "MTTR < 15 menit",
  },
];

export const contactSocials = [
  { name: "Email Pribadi", href: `mailto:${personal.email}`, icon: "Mail" },
  { name: "Email Server", href: `mailto:${personal.serverEmail}`, icon: "Mail" },
  {
    name: "WhatsApp",
    href: "https://wa.me/621399823073?text=Halo%20Fauzan,%20saya%20tertarik%20untuk%20berkolaborasi",
    icon: "MessageCircle",
  },
  { name: "LinkedIn", href: personal.linkedin, icon: "Linkedin" },
  { name: "GitHub", href: personal.github, icon: "Github" },
  { name: "GitLab", href: personal.gitlab, icon: "Gitlab" },
];
