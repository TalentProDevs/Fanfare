export const findHeight = (
  width: number = 300,
  height: number = 300,
  containerWidth: number = 700
) => {
  if (containerWidth >= 500) {
    const ratio = width / containerWidth;
    const renderedHeight = height / ratio;
    if (renderedHeight > containerWidth) {
      return containerWidth;
    }
    return renderedHeight;
  } else {
    const ratio = width / containerWidth;
    const containerMaxHeight = containerWidth * 1.25;
    const renderedHeight = (height / ratio) * (4 / 5);
    if (renderedHeight > containerMaxHeight) {
      return containerMaxHeight;
    }
    return renderedHeight;
  }
};
