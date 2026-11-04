import React from 'react';
import {
  Sparkles,
  Star,
  Zap,
  Flame,
  Coffee,
  Coins,
  Award,
  Shield,
  Briefcase,
  Heart,
  Tag,
  Wrench,
  Truck,
  Clock,
  LucideIcon,
} from 'lucide-react';

export interface SurchargeIconOption {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const SURCHARGE_ICON_OPTIONS: SurchargeIconOption[] = [
  { id: 'sparkles', label: 'Scintille', Icon: Sparkles },
  { id: 'star', label: 'Stella', Icon: Star },
  { id: 'zap', label: 'Fulmine', Icon: Zap },
  { id: 'flame', label: 'Fiamma', Icon: Flame },
  { id: 'coins', label: 'Monete / Cassa', Icon: Coins },
  { id: 'coffee', label: 'Caffè / Spezzato', Icon: Coffee },
  { id: 'award', label: 'Medaglia', Icon: Award },
  { id: 'shield', label: 'Sicurezza', Icon: Shield },
  { id: 'briefcase', label: 'Lavoro / Ruolo', Icon: Briefcase },
  { id: 'heart', label: 'Cura / Sanità', Icon: Heart },
  { id: 'tag', label: 'Etichetta', Icon: Tag },
  { id: 'wrench', label: 'Tecnico', Icon: Wrench },
  { id: 'truck', label: 'Trasporti', Icon: Truck },
  { id: 'clock', label: 'Reperibilità', Icon: Clock },
];

export function getSurchargeIcon(iconId?: string): LucideIcon {
  if (!iconId) return Sparkles;
  const found = SURCHARGE_ICON_OPTIONS.find((item) => item.id === iconId);
  return found ? found.Icon : Sparkles;
}

interface SurchargeIconProps {
  iconId?: string;
  className?: string;
}

export const SurchargeIcon: React.FC<SurchargeIconProps> = ({
  iconId,
  className = 'w-3.5 h-3.5',
}) => {
  const IconComponent = getSurchargeIcon(iconId);
  return <IconComponent className={className} />;
};
