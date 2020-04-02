import {Component, Prop, Host, h, State, Element, Listen} from "@stencil/core";
import {Page} from "../../api";
import {
  menuStyle,
  menuItemContainerStyle,
  menuBreakStyle,
  productRootLink,
} from "./menu.style";
import {getFilterKeyFromPage} from "../../utils/filters";
import {pageContext} from "../page/page.context";
import {SelectedFilters} from "../page/page.types";

const getScrollTopLocalStorageKey = (productGroupId: number): string =>
  `amplify-docs::product-group-${String(productGroupId)}`;

@Component({tag: "docs-menu", shadow: false})
export class DocsMenu {
  /*** the `Page` instance for which this menu is being rendered */
  @Prop() readonly page?: Page;
  /*** the currently-selected filter state */
  @Prop() readonly selectedFilters?: SelectedFilters;

  @Element() element?: HTMLDocsMenuElement;

  @State() filterKey?: string;
  @State() scrollTopLocalStorageKey?: string;

  previousScrollTop?: number;

  componentWillLoad() {
    this.filterKey = this.page && getFilterKeyFromPage(this.page);
    if (this.page?.productGroupId) {
      this.scrollTopLocalStorageKey = getScrollTopLocalStorageKey(
        this.page.productGroupId,
      );
      if (this.scrollTopLocalStorageKey) {
        const previousScrollTop = localStorage.getItem(
          this.scrollTopLocalStorageKey,
        );
        if (previousScrollTop) {
          this.previousScrollTop = parseInt(previousScrollTop);
        }
      }
    }
  }

  @Listen("scroll", {target: this.element})
  onMenuScroll(e: Event) {
    if (this.scrollTopLocalStorageKey) {
      localStorage.setItem(
        this.scrollTopLocalStorageKey,
        // @ts-ignore
        String(e.target.scrollTop),
      );
    }
  }

  componentDidLoad() {
    // console.log(this.previousScrollTop);
    if (this.element && this.previousScrollTop) {
      console.log(
        "in the dom: ",
        document.body.contains(this.element),
        " persisted offset: ",
        this.previousScrollTop,
      );
      this.element.scrollTo({top: this.previousScrollTop});
    }
  }

  renderVersionSwitch() {
    if (
      (this.page?.productRootLink?.route === "/lib" ||
        this.page?.productRootLink?.route === "/sdk") &&
      this.selectedFilters?.platform !== "js"
    ) {
      return (
        <docs-version-switch
          leftOption={{
            title: "Libraries",
            subTitle: "(preview)",
            href: "/lib",
          }}
          rightOption={{
            title: "SDK",
            subTitle: "(stable)",
            href: "/sdk",
          }}
        />
      );
    } else if (
      this.page?.productRootLink?.route === "/ui" ||
      this.page?.productRootLink?.route === "/ui-legacy"
    ) {
      return (
        <docs-version-switch
          leftOption={{
            title: "Latest",
            subTitle: "(v2)",
            href: "/ui",
          }}
          rightOption={{
            title: "Legacy",
            subTitle: "(v1)",
            href: "/ui-legacy",
          }}
        />
      );
    }
  }

  render() {
    const menu = this.page?.menu;
    return (
      <Host class={menuStyle}>
        {this.page?.filterKey && <docs-select-anchor page={this.page} />}
        {this.renderVersionSwitch()}
        {this.page?.productRootLink && (
          <docs-internal-link
            href={this.page.productRootLink.route}
            class={productRootLink}
          >
            {this.page.productRootLink.title}
          </docs-internal-link>
        )}
        {menu && (
          <div class={menuItemContainerStyle}>
            {menu.map((menuGroup) => (
              <docs-menu-group
                key={menuGroup.title}
                {...{menuGroup}}
                filterKey={this.filterKey}
              />
            ))}
          </div>
        )}
        <hr class={menuBreakStyle} />
        <docs-repo-actions page={this.page} />
        <docs-feedback-callout />
      </Host>
    );
  }
}

pageContext.injectProps(DocsMenu, ["selectedFilters"]);