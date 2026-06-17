export function formatRegistered(text: string) {
    return String(text)
      .split('®')
      .flatMap((part, i, arr) => [
        part,
        i < arr.length - 1 ? (
          <sup key={i} className="registered">
            <span className="text-[1.2rem]">®</span>
          </sup>
        ) : null
      ]);
  }