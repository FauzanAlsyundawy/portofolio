import { type SkillCategory } from "./types";

export const skills: SkillCategory[] = [
  {
    name: "Routing Protocols",
    icon: "Network",
    items: [
      { label: "BGP (eBGP/iBGP)", icon: "GitBranch" },
      { label: "OSPF", icon: "Share2" },
      { label: "IS-IS", icon: "Share2" },
      { label: "Static Routing", icon: "ArrowRight" },
      { label: "BFD", icon: "Zap" },
    ],
  },
  {
    name: "IP Management & Policy",
    icon: "Globe",
    items: [
      { label: "IPv4 Subnetting (CIDR/VLSM)", icon: "Split" },
      { label: "Route Summarization", icon: "Layers" },
      { label: "BGP Communities", icon: "GitBranch" },
      { label: "Prefix-List / Route-Map", icon: "Filter" },
      { label: "RPKI", icon: "Shield" },
      { label: "NAT/CGNAT", icon: "Repeat" },
    ],
  },
  {
    name: "Hardware & OS Vendor",
    icon: "Server",
    items: [
      { label: "Cisco IOS/IOS-XE", icon: "Cpu" },
      { label: "MikroTik RouterOS", icon: "Router" },
      { label: "Juniper Junos", icon: "Cpu" },
    ],
  },
  {
    name: "Monitoring & Analysis",
    icon: "Activity",
    items: [
      { label: "Wireshark", icon: "Pipette" },
      { label: "Zabbix", icon: "BarChart3" },
      { label: "PRTG", icon: "BarChart3" },
      { label: "Grafana", icon: "BarChart3" },
      { label: "SNMP/NetFlow", icon: "Gauge" },
    ],
  },
  {
    name: "Lab Environment & Automation",
    icon: "Terminal",
    items: [
      { label: "EVE-NG", icon: "Box" },
      { label: "GNS3", icon: "Box" },
      { label: "Python (Netmiko)", icon: "FileCode" },
      { label: "Ansible", icon: "Wrench" },
    ],
  },
];
