import {
  IconBarbell,
  IconBolt,
  IconFeather,
  IconShieldBolt,
  IconTornado,
  IconWindmill,
  type IconProps,
} from "@tabler/icons-react";
import type { FC } from "react";

/** Map a power's icon name (powers.ts) to its Tabler icon component. */
export const POWER_ICONS: Record<string, FC<IconProps>> = {
  tornado: IconTornado,
  bolt: IconBolt,
  windmill: IconWindmill,
  barbell: IconBarbell,
  "shield-bolt": IconShieldBolt,
  feather: IconFeather,
};
