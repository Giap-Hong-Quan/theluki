import slugify from "slugify";

export const slugifyHelper = (str: string): string => {
  if (!str) return "";
  return slugify(str, {
    replacement: "-",
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: true,
    locale: "vi",
    trim: true,
  });
};

export default slugifyHelper;
