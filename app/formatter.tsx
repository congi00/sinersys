export function formatRegistered(text: string, caSize?: string) {
    return String(text)
      .split('®')
      .flatMap((part, i, arr) => [
        part,
        i < arr.length - 1 ? (
          <sup key={i} className="registered">
            <span className="text-[1.2rem]">®</span>
          </sup>
        ) : null
      ]) && String(text)
      .split(' ca.')
      .flatMap((part, i, arr) => [
        part,
        i < arr.length - 1 ? (
            <span className={caSize} key={i}> ca.</span>
        ) : null
      ]);
}


