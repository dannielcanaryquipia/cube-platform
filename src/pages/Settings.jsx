import { useEffect } from "react";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import {
  GearSix,
  Info,
  Stack,
  User,
  Copyright,
  Code,
  Cube,
  Sun,
  Moon,
  Desktop,
} from "@phosphor-icons/react";
import { useThemeMode, setThemeMode } from "../lib/themeMode.js";

const CURRENT_YEAR = new Date().getFullYear();

const TECH_STACK = [
  { name: "React 19", detail: "UI library for building the interface" },
  { name: "Vite 8", detail: "Fast development server and production build tool" },
  { name: "React Router 7", detail: "Hash-based client routing" },
  { name: "cubing.js TwistyPlayer", detail: "3D cube playback and visualization" },
  { name: "Astryx Design System", detail: "UI components, tokens, and theming" },
  { name: "Phosphor Icons", detail: "Consistent icon set across the app" },
  { name: "oxlint", detail: "Fast linting for source quality checks" },
  { name: "Playwright-core", detail: "Headless browser UI verification" },
  {
    name: "Sticker-level simulator & IDA* solver",
    detail: "Hand-written cube simulator and solving engine used by the platform",
  },
];

const MODE_OPTIONS = [
  { id: "system", label: "System", icon: Desktop, detail: "Follow your device appearance" },
  { id: "light", label: "Light", icon: Sun, detail: "Light background" },
  { id: "dark", label: "Dark", icon: Moon, detail: "Dark background" },
];

function SectionCard({ icon, title, children }) {
  return (
    <Card elevation="low">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={icon} size="sm" aria-hidden="true" />
          <Heading level={2}>{title}</Heading>
        </HStack>
        {children}
      </VStack>
    </Card>
  );
}

export default function Settings() {
  const mode = useThemeMode();
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Settings & About · Layer by Layer";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <VStack gap={5} as="section" aria-labelledby="settings-title">
      <title>Settings &amp; About · Layer by Layer</title>
      <meta
        name="description"
        content="About Layer by Layer, a clean CFOP 3x3 Rubik's Cube learning platform. View the tech stack, creator information, and copyright details."
      />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={GearSix} size="md" aria-hidden="true" />
          <Heading level={1} id="settings-title">Settings &amp; About</Heading>
        </HStack>
        <Text type="body" color="secondary">
          Project information, technology, and credits for Layer by Layer.
        </Text>
      </VStack>

      <SectionCard icon={Sun} title="Appearance">
        <VStack gap={2}>
          <Text type="body" color="secondary">
            Choose how Layer by Layer looks. System follows your device appearance setting.
          </Text>
          <HStack gap={2} wrap="wrap" role="group" aria-label="Color mode">
            {MODE_OPTIONS.map((opt) => (
              <Button
                key={opt.id}
                label={opt.label}
                variant={mode === opt.id ? "primary" : "secondary"}
                size="sm"
                icon={<Icon icon={opt.icon} size="sm" />}
                onClick={() => setThemeMode(opt.id)}
                aria-pressed={mode === opt.id}
              />
            ))}
          </HStack>
          <Text type="supporting" color="secondary">
            {MODE_OPTIONS.find((o) => o.id === mode)?.detail}
          </Text>
        </VStack>
      </SectionCard>

      <SectionCard icon={Info} title="About Website">
        <VStack gap={2}>
          <Text type="body" weight="semibold">Layer by Layer</Text>
          <Text type="body" color="secondary">
            Layer by Layer is a clean CFOP 3x3 Rubik&apos;s Cube learning platform.
            It guides learners through Cross, F2L, OLL, and PLL with clear
            recognition diagrams, verified algorithms, and interactive 3D playback.
          </Text>
        </VStack>
      </SectionCard>

      <SectionCard icon={Stack} title="Tech Stack Used">
        <VStack gap={0} className="settings-stack">
          {TECH_STACK.map((item) => (
            <HStack key={item.name} gap={3} vAlign="start" className="settings-stack__row">
              <Icon icon={Code} size="sm" aria-hidden="true" className="settings-stack__icon" />
              <VStack gap={1}>
                <Text weight="semibold">{item.name}</Text>
                <Text type="supporting" color="secondary">{item.detail}</Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </SectionCard>

      <SectionCard icon={User} title="Creator / Developer">
        <VStack gap={2}>
          <Text type="body">
            <Text as="span" weight="semibold">Danniel Canary Quipia</Text>
          </Text>
          <HStack gap={2} vAlign="center">
            <Icon icon={Cube} size="sm" aria-hidden="true" />
            <Text type="body" color="secondary">
              GitHub:{" "}
              <Text as="span" weight="semibold">dannielcanaryquipia</Text>
            </Text>
          </HStack>
        </VStack>
      </SectionCard>

      <Card elevation="low" as="footer" className="settings-footer">
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={Copyright} size="sm" aria-hidden="true" />
            <Heading level={2}>Copyright</Heading>
          </HStack>
          <Text type="body" color="secondary">
            &copy; {CURRENT_YEAR} Danniel Canary Quipia. All rights reserved.
          </Text>
          <Text type="supporting" color="secondary">
            Layer by Layer and its original content, design, and educational materials
            are protected by copyright. Unauthorized reproduction or distribution is
            prohibited.
          </Text>
        </VStack>
      </Card>
    </VStack>
  );
}
