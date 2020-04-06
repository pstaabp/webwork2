// eslint-disable-next-line no-undef
module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    "plugin:vue/vue3-recommended",
    "@vue/prettier",
    "@vue/typescript",
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "@vue/prettier/@typescript-eslint",
  ],
  rules: {
    camelcase: "off",
    "@typescript-eslint/camelcase": ["off", { properties: "never" }],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "method",
        format: ["camelCase", "UPPER_CASE"],
      },
      {
        selector: "property",
        format: ["snake_case", "UPPER_CASE", "camelCase", "PascalCase"],
      },
      {
        selector: "function",
        format: ["camelCase"],
      },
      {
        selector: "variableLike",
        format: ["camelCase", "snake_case", "UPPER_CASE"],
      },
      {
        selector: "memberLike",
        format: ["snake_case", "UPPER_CASE"],
      },
      {
        selector: "parameter",
        format: ["snake_case"],
        leadingUnderscore: "allow",
      },
    ],
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
  },
};
