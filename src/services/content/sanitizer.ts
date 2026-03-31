const DEFAULT_MAX_LENGTH = 50_000

export function sanitizeContent(
  text: string,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string {
  let result = text

  // Remove null bytes and other control characters (except newlines and tabs)
  // eslint-disable-next-line no-control-regex
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Normalize line endings
  result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Collapse runs of more than 3 consecutive newlines into 2
  result = result.replace(/\n{3,}/g, '\n\n')

  // Collapse runs of horizontal whitespace (spaces/tabs) longer than 1 into a single space
  result = result.replace(/[ \t]{2,}/g, ' ')

  // Trim leading/trailing whitespace
  result = result.trim()

  // Truncate to maxLength
  if (result.length > maxLength) {
    result = result.slice(0, maxLength).trimEnd()
  }

  return result
}
