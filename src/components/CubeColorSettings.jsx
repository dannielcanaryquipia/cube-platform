import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { FACE_KEYS, FACE_NAME, DEFAULT_COLORS, useCubeColors, setCubeColor, resetCubeColors } from "../lib/cubeColors.js";

export default function CubeColorSettings() {
  const colors = useCubeColors();
  return (
    <VStack gap={2} className="cube-color-settings">
      <Text weight="bold">Sticker colors</Text>
      <Text type="supporting" color="secondary">Match the colors to your physical cube. Changes apply across diagrams and the 3D player.</Text>
      <HStack gap={2} wrap="wrap" className="cube-color-settings__grid">
        {FACE_KEYS.map((face) => (
          <label key={face} className="cube-color-settings__item">
            <input
              type="color"
              value={colors[face]}
              onChange={(e) => setCubeColor(face, e.target.value)}
              aria-label={`${FACE_NAME[face]} face color`}
              className="cube-color-settings__input"
            />
            <Text as="span" type="supporting">{FACE_NAME[face]}</Text>
            {colors[face].toLowerCase() !== DEFAULT_COLORS[face].toLowerCase() && (
              <button type="button" className="cube-color-settings__reset" onClick={() => setCubeColor(face, DEFAULT_COLORS[face])} aria-label={`Reset ${FACE_NAME[face]} color`}>
                reset
              </button>
            )}
          </label>
        ))}
      </HStack>
      <HStack>
        <Button label="Reset all colors" variant="secondary" size="sm" onClick={resetCubeColors} />
      </HStack>
    </VStack>
  );
}
