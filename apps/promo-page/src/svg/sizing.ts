import { SvgProps } from "./types"

export const getSize = (
  { dimensions }: SvgProps,
  defaultDimensions: [string, string]
): [string, string] => {
  return dimensions
    ? dimensions.length > 1
      ? (dimensions as [string, string])
      : [dimensions[0], dimensions[0]]
    : defaultDimensions
}
