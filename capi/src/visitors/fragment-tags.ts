import * as t from "../types";
import clone from "clone-deep";
import traverse from "traverse";

export const fragmentTags: t.Transformer = ({
  node,
  srcPath,
  lexicalScope,
  ctx,
  page,
}) => {
  if (Array.isArray(node) && node[0] === "inline-fragment") {
    const [, props] = node;
    if (!props || !props.src)
      throw new Error(
        ["No `src` provided to `inline-fragment` ", `("${srcPath}")`].join(""),
      );
    // eslint-disable-next-line
    // @ts-ignore
    const {src, ...filters} = props;
    if (filters) {
      const criteria = Object.entries(filters) as [string, string][];
      if (criteria.length > 0) {
        page.filters === undefined &&
          ((page.filters = {}) as Record<string, string[]>);

        criteria.forEach(([k, v]) => {
          if (page.filters) {
            if (page.filters[k] === undefined) {
              page.filters[k] = [v];
            } else {
              !page.filters[k].includes(v) && page.filters[k].push(v);
            }
          }
        });
      }
    }
    const {srcPath: referencedFragmentPath} = ctx.resolvePathDeduction(
      src as string,
      srcPath,
      "fragment",
    );
    const fragmentBody = ctx.fragmentBySrcPath.get(referencedFragmentPath);
    const [tag, newProps] =
      Object.keys(filters).length > 0
        ? ["docs-filter-target", {filters}]
        : ["div", null];

    if (fragmentBody) {
      const fragmentBodyClone = clone(fragmentBody);

      // if filters exist...
      const filterEntries = Object.entries(filters);
      const firstFilterEntry = filterEntries[0];
      if (firstFilterEntry) {
        const [filterKey, filterValue] = firstFilterEntry;
        if (filterKey && filterValue) {
          // traverse and prefix all h2 & h3 `id`s and docs-in-page-link
          // `targetId`s according to filters
          traverse(fragmentBodyClone).forEach(function(node) {
            if (Array.isArray(node) && typeof node[0] === "string") {
              const [tagName, props, ...children] = node;

              // no need to continue traversal into code blocks
              if (tagName === "amplify-code-block" || tagName === "code") {
                this.block();
                return;
              }

              // if it's an in-page-link, we have a winner!
              if (tagName === "docs-in-page-link" && props) {
                // update the child (an h2 or h3) with the appropriately-prefixed id
                const [childTag, childProps, ...grandchildren] = children[0];
                const updatedChild = [
                  childTag,
                  {
                    ...childProps,
                    id: `${childProps.id}-${filterKey}-${filterValue}`,
                  },
                  ...grandchildren,
                ];

                // update the in-page-link
                this.update(
                  [
                    tagName,
                    {
                      ...props,
                      targetId: `${props.targetId}-${filterKey}-${filterValue}`,
                    },
                    updatedChild,
                  ],
                  true,
                );
              }
            }
          });
        }
      }

      // finally, place the fragment body clone (which carries the correct `id`s/`targetId`s)
      lexicalScope.update([tag, newProps, ...fragmentBodyClone]);
    }
  }
};
