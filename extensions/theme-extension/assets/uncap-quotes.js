const api = new QuotesDraftOrderRequestClient();
const uqShopName = Shopify.shop;
const ucShopMoney = document
  .querySelector("#uncap_store_currency")
  .getAttribute("content");
const ucActiveCurrency = Shopify.currency.active;
let ucCustomerId = (__st && __st.cid) || "";
let ucPage = (__st && __st.p) || "";
let ucCountryState = [];
const ucCartJson = async function (haGetUrl) {
  const haCartResponse = await fetch(haGetUrl, {
    method: "GET",
  });
  return haCartResponse.json();
};

const productDataCache = new Map();

/**
 * @param {string | null | undefined} handle
 * @returns {Promise<object | null>}
 */
async function fetchProductDataByHandle(handle) {
  if (!handle) return null;

  if (productDataCache.has(handle)) {
    return productDataCache.get(handle);
  }

  const response = await fetch(`/products/${encodeURIComponent(handle)}.js`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  productDataCache.set(handle, data);
  return data;
}

/**
 * Match theme / Gadget variant ids that may include a suffix (e.g. "123-...") to Shopify JSON ids.
 * @param {unknown} a
 * @param {unknown} b
 */
const ucVariantIdsMatch = (a, b) => {
  if (a == null || b == null) return false;
  const sa = String(a).trim();
  const sb = String(b).trim();
  if (sa === sb) return true;
  const na = sa.match(/^(\d+)/)?.[1];
  const nb = sb.match(/^(\d+)/)?.[1];
  if (na && nb && na === nb) return true;
  return false;
};

/**
 * If `data-variant-id` is set, use that variant's `available`; otherwise use product-level `available`.
 * @param {object | null} productJson
 * @param {string | null | undefined} variantIdAttr
 */
const resolveInventoryAvailability = (productJson, variantIdAttr) => {
  if (!productJson) return true;

  const vid = variantIdAttr?.trim();
  const variants = productJson.variants || [];

  if (vid) {
    const variant = variants.find((v) => ucVariantIdsMatch(v.id, vid));
    if (variant) return !!variant.available;
    return !!productJson.available;
  }

  return !!productJson.available;
};

/** Cached quote API result so variant/URL updates do not re-fetch settings every time. */
let ucQuoteProductSettingsCache = null;

/**
 * @returns {string | null}
 */
const ucGetUrlVariantId = () => {
  const fromSearch = new URLSearchParams(window.location.search).get("variant");
  if (fromSearch?.trim()) return fromSearch.trim();
  const hashMatch = window.location.hash.match(/variant=(\d+)/);
  return hashMatch?.[1] || null;
};

/**
 * @param {Element} container
 * @returns {string | null}
 */
const ucGetFormVariantIdNearContainer = (container) => {
  let parent = container.parentElement;
  while (parent && parent !== document.body) {
    const form = parent.querySelector('form[action="/cart/add"]');
    if (form) {
      const input = form.querySelector('input[name="id"], select[name="id"]');
      if (input?.value?.trim()) return input.value.trim();
    }
    parent = parent.parentElement;
  }
  return null;
};

/**
 * @param {Element} container
 */
const ucEnsureDefaultVariantId = (container) => {
  if (!container.getAttribute("data-default-variant-id")) {
    const initial = container.getAttribute("data-variant-id")?.trim();
    if (initial) {
      container.setAttribute("data-default-variant-id", initial);
    }
  }
};

/**
 * Active variant: URL ?variant= → form selection → data-variant-id (Liquid default).
 * @param {Element} container
 * @returns {string | null}
 */
const ucResolveVariantIdForContainer = (container) => {
  ucEnsureDefaultVariantId(container);
  const urlVariant = ucGetUrlVariantId();
  const formVariant = ucGetFormVariantIdNearContainer(container);
  const dataVariant = container.getAttribute("data-variant-id")?.trim() || null;
  const defaultVariant = container.getAttribute("data-default-variant-id")?.trim() || null;

  return urlVariant || formVariant || dataVariant || defaultVariant;
};

/**
 * @param {object | null} productJson
 * @param {string | null | undefined} variantId
 * @param {string | null | undefined} fallbackVariantId - data-variant-id / default when URL variant unknown
 */
const resolveInventoryAvailabilityWithFallback = (
  productJson,
  variantId,
  fallbackVariantId
) => {
  if (!productJson) return true;

  const variants = productJson.variants || [];
  const primary = variantId?.trim();

  if (primary) {
    const variant = variants.find((v) => ucVariantIdsMatch(v.id, primary));
    if (variant) return !!variant.available;

    const fallback = fallbackVariantId?.trim();
    if (fallback && !ucVariantIdsMatch(primary, fallback)) {
      const fallbackVariant = variants.find((v) => ucVariantIdsMatch(v.id, fallback));
      if (fallbackVariant) return !!fallbackVariant.available;
    }

    return !!productJson.available;
  }

  return resolveInventoryAvailability(productJson, fallbackVariantId);
};

/**
 * Enable/disable quote button for one container from cached settings + product JSON.
 * @param {Element} container
 */
const ucRefreshQuoteButtonForContainer = async (container) => {
  if (!ucQuoteProductSettingsCache) {
    await ucAddToCartGetQuotesDetails();
    return;
  }

  const { settingBase, byProduct, showQuote } = ucQuoteProductSettingsCache;
  const productId = container.getAttribute("data-product-id");
  if (!productId) return;

  const showForProduct = byProduct[productId] ?? showQuote;
  if (!showForProduct) {
    container.innerHTML = "";
    return;
  }

  const activeVariantId = ucResolveVariantIdForContainer(container);
  if (activeVariantId) {
    container.setAttribute("data-variant-id", activeVariantId);
  }

  const handle = container.getAttribute("data-product-handle")?.trim() || null;
  const fallbackVariantId =
    container.getAttribute("data-default-variant-id")?.trim() ||
    container.getAttribute("data-variant-id")?.trim() ||
    null;

  const productJson = handle ? await fetchProductDataByHandle(handle) : null;
  const inventoryAvailable = resolveInventoryAvailabilityWithFallback(
    productJson,
    activeVariantId,
    fallbackVariantId
  );

  ucRenderAddToQuotesButtonForContainer(container, settingBase, { inventoryAvailable });
};

let ucVariantRefreshTimer = null;

const ucScheduleQuoteButtonsRefresh = () => {
  if (ucVariantRefreshTimer) clearTimeout(ucVariantRefreshTimer);
  ucVariantRefreshTimer = setTimeout(async () => {
    ucVariantRefreshTimer = null;
    const containers = document.querySelectorAll(".uc-add-to-quotes");
    if (!containers.length) return;

    if (!ucQuoteProductSettingsCache) {
      await ucAddToCartGetQuotesDetails();
      return;
    }

    await Promise.all(
      Array.from(containers).map((container) => ucRefreshQuoteButtonForContainer(container))
    );
  }, 80);
};

/**
 * After successful add-to-quote redirect (add_to_cart_redirect / direct_checkout).
 * @param {Record<string, unknown> | null | undefined} setting
 * @param {object} data - /cart/add.js response
 */
const handleAddToQuoteRedirect = (setting, data) => {
  const direct_checkout = String(setting?.add_to_cart_redirect ?? "3");

  if (direct_checkout === "1") {
    window.location.href = "/checkout";
  } else if (direct_checkout === "2") {
    if (typeof ucQuoteCallback === "function") {
      ucQuoteCallback(data);
    } else {
      window.location.href = "/cart";
    }
  } else {
    window.location.href = "/cart";
  }
};


const ucLayoutCssEvent = (setting) => {
  if (document.querySelectorAll("#ucLayoutCssCart").length === 0) {
    if (setting?.quote_button_font_style) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css?family=${setting.quote_button_font_style.replaceAll(
        " ",
        "+"
      )}`;
      document.head.appendChild(link);
    }
    let ucCss = '<style id="ucLayoutCssCart">';
    if (setting?.quote_button_font_style) {
      ucCss += `.uc-request-quote-btn{ font-family: '${setting.quote_button_font_style}';}`;
    }
    ucCss += `.uc-request-quote-btn{background-color: ${setting.quote_button_background_color
      }; border-color: ${setting.quote_button_background_color};color: ${setting.quote_button_color
      };  -webkit-animation:quote-glowing 1200ms infinite;-moz-animation:quote-glowing 1200ms infinite;-o-animation:quote-glowing 1200ms infinite;animation:quote-glowing 1200ms infinite; margin-bottom: ${setting.is_effect_quote_button == 1 ? "25px" : "0"
      }}`;
    ucCss += `.uc-request-quote-btn:hover{background-color: ${setting.quote_button_hover_background_color}; border-color: ${setting.quote_button_hover_background_color};color: ${setting.quote_button_hover_color};}`;
    ucCss += `.uc-modal-title{text-align: ${setting.quote_popup_title_align == 1
      ? "left"
      : setting.quote_popup_title_align == 2
        ? "right"
        : "center"
      }; color: ${setting.quote_popup_title_color}}`;
    ucCss += `.uc-modal-header-heading, .uc-modal-header-heading h5{text-align: ${setting.quote_popup_heading_align == 1
      ? "left"
      : setting.quote_popup_heading_align == 2
        ? "right"
        : "center"
      }; color: ${setting.quote_popup_heading_color}}`;
    ucCss += `.uc-modal-cancel-btn{color: ${setting.quote_cancel_button_color}; background-color:${setting.quote_close_button_color}}`;
    ucCss += `.uc-modal-submit-btn, #successToast{color: ${setting.quote_submit_button_color}; background-color:${setting.quote_submit_button_background_color}}`;
    ucCss += `.uc-button-loading::after,.button-loading-spinner::after{border-color:rgba(255,255,255,.35);border-top-color:${setting.quote_submit_button_color};}`;
    if (setting.is_effect_quote_button == 1) {
      ucCss += `@-webkit-keyframes quote-glowing {
                0% {background-color: ${setting.quote_button_background_color}; -webkit-box-shadow: 0 0 3px ${setting.quote_button_background_color}; }
                50% { background-color: ${setting.quote_button_background_color}; -webkit-box-shadow: 0 0 25px ${setting.quote_button_background_color}; }
                100% { background-color: ${setting.quote_button_background_color}; -webkit-box-shadow: 0 0 3px ${setting.quote_button_background_color}; }
            };
            @-moz-keyframes quote-glowing {
                0% { background-color: ${setting.quote_button_background_color}; -moz-box-shadow: 0 0 3px ${setting.quote_button_background_color}; }
                50% { background-color: ${setting.quote_button_background_color}; -moz-box-shadow: 0 0 25px ${setting.quote_button_background_color}; }
                100% { background-color: ${setting.quote_button_background_color}; -moz-box-shadow: 0 0 3px ${setting.quote_button_background_color}; }
            };@-o-keyframes quote-glowing {
                0% { background-color: ${setting.quote_button_background_color}; box-shadow: 0 0 3px ${setting.quote_button_background_color}; }
                50% { background-color: ${setting.quote_button_background_color}; box-shadow: 0 0 25px ${setting.quote_button_background_color}; }
                100% { background-color: ${setting.quote_button_background_color}; box-shadow: 0 0 3px ${setting.quote_button_background_color}; }
            };
           @keyframes quote-glowing {
                0% { background-color: ${setting.quote_button_background_color}; box-shadow: 0 0 3px ${setting.quote_button_background_color}; }
                50% { background-color: ${setting.quote_button_background_color}; box-shadow: 0 0 25px ${setting.quote_button_background_color}; }
                100% { background-color: ${setting.quote_button_background_color}; box-shadow: 0 0 3px ${setting.quote_button_background_color}; }
            }`;
    }
    ucCss += "</style>";
    document
      .getElementsByTagName("head")[0]
      .insertAdjacentHTML("beforeend", ucCss);
  }
};
const ucAddToQuotesCssEvent = (setting) => {
  if (document.querySelectorAll("#ucAddToQuotesCss").length === 0) {
    if (setting?.add_to_cart_btn_font) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css?family=${setting.add_to_cart_btn_font.replaceAll(
        " ",
        "+"
      )}`;
      document.head.appendChild(link);
    }
    let ucCss = '<style id="ucAddToQuotesCss">';

    if (setting.add_to_cart_btn_font) {
      ucCss += `.uc-add-to-quotes-btn{font-family: '${setting.add_to_cart_btn_font}';}`;
    }

    ucCss += `.uc-add-to-quotes-btn{background-color: ${setting.add_to_cart_btn_bg_color}; border-color: ${setting.add_to_cart_btn_border_color};color: ${setting.add_to_cart_btn_text_color};}`;
    ucCss += `.uc-add-to-quotes-btn:hover{background-color: ${setting.add_to_cart_btn_bg_hover_color}; border-color: ${setting.add_to_cart_btn_border_hover_color};color: ${setting.add_to_cart_btn_text_hover_color};}`;
    ucCss += `.uc-add-to-quotes-btn.uc-button-loading::after,.uc-add-to-quotes-btn.button-loading-spinner::after{border-color:rgba(255,255,255,.35);border-top-color:${setting.add_to_cart_btn_text_color};}`;
    if (setting.is_add_to_cart_quotes == "1") {
      ucCss += `.product-form__submit{display: none !important}`;
    }
    ucCss += "</style>";
    document
      .getElementsByTagName("head")[0]
      .insertAdjacentHTML("beforeend", ucCss);
  }
};

const getFieldName = (input) => {
  const firstLetter = input.name.charAt(0).toUpperCase();
  return firstLetter + input.name.slice(1);
};
const showError = (input, msg) => {
  const formControl = input.parentElement;
  const small = formControl.querySelector("small");
  formControl.classList.add("error");
  small.textContent = msg;
};

const showSuccess = (input) => {
  const formControl = input.parentElement;
  formControl.classList.remove("error");
  formControl.querySelector("small").innerHTML = "";
};

const successToast = (message) => {
  let x = document.getElementById("successToast");
  x.classList.add("show");
  x.querySelector("span").innerHTML = message;
  setTimeout(() => {
    x.classList.remove("show");
  }, 3000);
};

const errorToast = (message) => {
  let x = document.getElementById("errorToast");
  x.classList.add("show");
  x.querySelector("span").innerHTML = message;
  setTimeout(() => {
    x.classList.remove("show");
  }, 8000);
};
const validate = (input) => {
  if (input.name === "address 2") {
    showSuccess(input);
  } else {
    if (input.value.trim() === "") {
      showError(input, `${getFieldName(input)} is required`);
    } else if (input.name === "email" || input.name === "Email") {
      const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(input.value)) {
        showSuccess(input);
      } else {
        showError(input, `Email address is invalid.`);
      }
    } else if (input.name === "phone" || input.name === "Phone") {
      const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
      if (re.test(input.value)) {
        showSuccess(input);
      } else {
        showError(input, `Phone is invalid.`);
      }
    } else {
      showSuccess(input);
    }
  }
};

const checkRequired = (inputArr, type) => {
  inputArr.forEach((input) => {
    if (type === "noSubmit") {
      validate(input);
    } else {
      input.addEventListener("blur", () => validate(input));
      input.addEventListener("change", (e) => {
        if (input.name === "Country") {
          const findProvince = ucCountryState.find(
            (x) => x.countryCode === input.value
          );
          const provinceElement = document.querySelector("#province");

          if (findProvince?.states.length > 0) {
            let ucProvinceOption = "";

            if (provinceElement) {
              ucProvinceOption += '<option value="">Select Province</option>';
              findProvince.states.forEach((x, i) => {
                const selected = x.code === window.uqCustomer.province ? "selected" : "";
                ucProvinceOption += `<option value="${x.code}" ${selected}>${x.name}</option>`;
              });
              provinceElement.innerHTML = ucProvinceOption;
              provinceElement.value = "";
            } else {
              ucProvinceOption += '<div class="uc-col-4">';
              ucProvinceOption += '<div class="uc-form-group">';
              ucProvinceOption += '<label class="uc-form-label">Province</label>';
              ucProvinceOption += `<select class="uc-form-control" name="Province" id="province">`;
              ucProvinceOption += '<option value="">Select Province</option>';
              findProvince.states.forEach((x, i) => {
                const selected = x.code === window.uqCustomer.province ? "selected" : "";
                ucProvinceOption += `<option value="${x.code}" ${selected}>${x.name}</option>`;
              });
              ucProvinceOption += "</select><small></small>";
              ucProvinceOption += "</div></div>";

              input.parentNode.parentElement.insertAdjacentHTML("afterEnd", ucProvinceOption);
            }
          } else if (provinceElement) {
            provinceElement.parentElement.parentElement.remove();
          }
        }
      });
    }
  });
};

const onCloseModal = () => {
  document.querySelector(".uc-modal").remove();
  document.querySelector("body").classList.remove("uc_modal_is_open");
  document.body.style.overflow = "auto";
};

const renderModal = (customFields, setting) => {

  document.querySelectorAll(".uc-modal").forEach(el => el.remove());

  document.querySelector("body").classList.remove("uc_modal_is_open");
  const appendData = document.querySelector("body");
  document.body.style.overflow = "hidden";

  let ucModal = `
    <div class="uc-modal uc-show-modal">
      <div class="uc-modal-content">
        <div class="uc-modal-header">
          <div class="uc-modal-header-title">
            <h4 class="uc-modal-title">${setting.quote_popup_title}</h4>
            <button type="button" class="uc-modal-close" onclick="onCloseModal()"><span>×</span></button>
          </div>
          <div class="uc-modal-header-heading"><h5>${setting.quote_popup_heading}</h5></div>
        </div>
        <div class="uc-modal-body">
          <div class="uc-row">
            <div class="uc-col-6">
              <div class="uc-form-group">
                <label class="uc-form-label">First Name</label>
                <input type="text" class="uc-form-control" name="First name" id="first_name" value="${window.uqCustomer.first_name}">
                <small></small>
              </div>
            </div>
            <div class="uc-col-6">
              <div class="uc-form-group">
                <label class="uc-form-label">Last Name</label>
                <input type="text" class="uc-form-control" name="Last name" id="last_name" value="${window.uqCustomer.last_name}">
                <small></small>
              </div>
            </div>
          </div>

          <div class="uc-row">
            <div class="uc-col-6">
              <div class="uc-form-group">
                <label class="uc-form-label">Email</label>
                <input type="text" class="uc-form-control" name="email" id="email" value="${window.uqCustomer.email}">
                <small></small>
              </div>
            </div>
            <div class="uc-col-6">
              <div class="uc-form-group">
                <label class="uc-form-label">Phone</label>
                <input type="text" class="uc-form-control" name="phone" id="phone" value="${window.uqCustomer.phone}">
                <small></small>
              </div>
            </div>
          </div>

          <div class="uc-row">
            <div class="uc-col-6">
              <div class="uc-form-group">
                <label class="uc-form-label">Address 1</label>
                <textarea id="address1" name="address 1" class="uc-form-control">${window.uqCustomer.address1}</textarea>
                <small></small>
              </div>
            </div>
            <div class="uc-col-6">
              <div class="uc-form-group">
                <label class="uc-form-label">Address 2</label>
                <textarea id="address2" name="address 2" class="uc-form-control">${window.uqCustomer.address2}</textarea>
                <small></small>
              </div>
            </div>
          </div>

          <div class="uc-row">
            <div class="uc-col-4">
              <div class="uc-form-group">
                <label class="uc-form-label">Country</label>
                <select class="uc-form-control" name="Country" id="country">
                  <option value="">Select Country</option>
                  ${ucCountryState.map((x, i) => {
    const selected = x.countryCode === window.uqCustomer.country ? "selected" : "";
    return `<option value="${x.countryCode}" ${selected}>${x.country}</option>`;
  }).join("")}
                </select>
                <small></small>
              </div>
            </div>
            <div class="uc-col-4">
              <div class="uc-form-group">
                <label class="uc-form-label">City</label>
                <input type="text" class="uc-form-control" name="city" id="city" value="${window.uqCustomer.city}">
                <small></small>
              </div>
            </div>
            <div class="uc-col-4">
              <div class="uc-form-group">
                <label class="uc-form-label">Zip</label>
                <input type="text" class="uc-form-control" name="zip" id="zip" value="${window.uqCustomer.zip}">
                <small></small>
              </div>
            </div>
          </div>

          <div class="uc-form-group">
            <label class="uc-form-label">Note</label>
            <textarea id="note" name="note" class="uc-form-control"></textarea>
            <small></small>
          </div>

          ${customFields.map((x, i) => `
            <div class="uc-form-group" key="${i}">
              <label class="uc-form-label">${x.fieldTitle}</label>
              ${x.fieldType === "1"
      ? `<input type="text" class="uc-form-control" name="${x.fieldTitle}" id="${x.name}">`
      : `<textarea name="${x.fieldTitle}" id="${x.name}" class="uc-form-control"></textarea>`}
              <small></small>
            </div>
          `).join("")}
        </div>

        <div class="uc-modal-footer">
          <button type="button" class="uc-modal-cancel-btn uc-btn" onclick="onCloseModal()">${setting.quote_cancel_button_text}</button>
          <button type="button" class="uc-modal-submit-btn uc-btn" is_redirect="${setting.is_redirect}" redirect_page="${setting.redirect_page}" onclick="onSubmitQuotesRequest(this)">
            <span class="uc-button-text">${setting.quote_submit_button_text}</span>
          </button>
        </div>
      </div>
    </div>
    <div id="successToast" class="toast"><span></span></div>
    <div id="errorToast" class="toast"><span></span></div>
  `;

  appendData.insertAdjacentHTML("beforeend", ucModal);

  // Add province select immediately if country is selected
  const selectedCountry = window.uqCustomer.country;
  if (selectedCountry) {
    const findProvince = ucCountryState.find(x => x.countryCode === selectedCountry);
    if (findProvince?.states.length > 0) {
      let ucProvinceOption = `
        <div class="uc-col-4">
          <div class="uc-form-group">
            <label class="uc-form-label">Province</label>
            <select class="uc-form-control" name="Province" id="province">
              <option value="">Select Province</option>
              ${findProvince.states.map((x) => {
        const selected = x.code === window.uqCustomer.province ? "selected" : "";
        return `<option value="${x.code}" ${selected}>${x.name}</option>`;
      }).join("")}
            </select>
            <small></small>
          </div>
        </div>
      `;
      const countryInput = document.querySelector("#country");
      countryInput.parentNode.parentElement.insertAdjacentHTML("afterEnd", ucProvinceOption);
    }
  }

  // Run validation hook
  const filedData = Array.from(document.querySelectorAll(".uc-form-control"));
  checkRequired(filedData);
};

const onSubmitQuotesRequest = async (btn) => {
  let filedData = [];
  document.querySelectorAll(".uc-form-control").forEach((thisInput) => {
    let name = thisInput;
    filedData.push(name);
  });
  checkRequired(filedData, "noSubmit");
  if (document.querySelectorAll(".uc-form-group.error").length) {
    return true;
  } else {
    btn.classList.add("uc-button-loading");
    let customer_detail = {};
    let customAttributes = {};
    const defaultField = ["first_name", "last_name", "email", "phone", "address1", "address2", "country", "province", "city", "zip", "note"];
    filedData.forEach((x) => {
      if (defaultField.includes(x.id)) {
        customer_detail = { ...customer_detail, [x.id]: x.value };
      } else {
        customAttributes = { ...customAttributes, [x.id]: x.value };
      }
    });
    const findPhoneCode = ucCountryState.find((x) => x.countryCode === customer_detail.country);
    if (findPhoneCode?.phoneCode) {
      if (findPhoneCode.phoneCode.includes("+")) {
        customer_detail = { ...customer_detail, phone: `${findPhoneCode.phoneCode}${customer_detail.phone}` };
      } else {
        customer_detail = { ...customer_detail, phone: `+${findPhoneCode.phoneCode}${customer_detail.phone}` };
      }
    }
    const quCartJson = await ucCartJson("/cart.json").then((quCartResponse) => {
      return quCartResponse;
    });
    if (quCartJson.item_count > 0) {
      try {
        const response = await api.quotes.create({
          customer: { _link: ucCustomerId },
          order_detail: quCartJson,
          customer_detail: customer_detail,
          customAttributes: customAttributes,
          shop: {
            _link: window.shopId
          },
          uqShopName: uqShopName
          // shop: window.shopId
        });
        btn.classList.remove("uc-button-loading");
        document.querySelector(".uc-modal").remove();
        document.body.style.overflow = "auto";
        successToast("Quote request successfully");
        const is_redirect = btn.getAttribute("is_redirect");
        const redirect_page = btn.getAttribute("redirect_page");
        await fetch("/cart/clear.js", {
          method: "POST",
          dataType: "json",
          async: false,
        }).then((quCartResponse) => {

        });

        if (is_redirect == 1 && (redirect_page != null || redirect_page != "")) {
          window.location.href = `/pages/${redirect_page.replace("/", "")}`;
        }

      } catch (error) {
        btn.classList.remove("uc-button-loading");
        let errorMessage = '';
        if (error?.message) {
          errorMessage = error.message.replace("GGT_UNKNOWN:", "");
        } else {
          errorMessage = "Something went wrong, please try again";
        }
        errorToast(errorMessage);
      }
    }
  }
};

const ucRenderQuotesButton = async (customFields, setting) => {
  ucLayoutCssEvent(setting);
  const appendData = document.querySelector(".uc-request-quotes");
  let ucQuotesButton = "";
  ucQuotesButton +=
    '<button class="uc-request-quote-btn" type="button">' +
    setting?.quote_button_text +
    "</button>";
  appendData.innerHTML = ucQuotesButton;
  if (ucCountryState.length === 0) {
    const allRecords = [];
    let records = await api.countryAndState.findMany({
      first: 150,
      select: { countryCode: true, country: true, phoneCode: true, states: true },
      sort: { country: "Ascending" },
    });
    allRecords.push(...records);
    while (records.hasNextPage) {
      // paginate
      records = await records.nextPage();
      allRecords.push(...records);
    }
    ucCountryState = allRecords;
  }



  document.querySelector("button.uc-request-quote-btn").addEventListener("click", async () => {

    renderModal(customFields, setting);
    const analyticCreate = await api.analyticCreate(
      {
        payload: { shopId: window.shopId, },
      }
    );
    // await fetch(`${ucApiUrl}/analytic`, {
    //     method: "POST",
    //     body: JSON.stringify({ shop: uqShopName }),
    //     cache: "no-cache",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    // })
    //     .then((response) => response.json())
    //     .then((ucCartResult) => {
    //         if (ucCartResult.status === 200) {
    //         } else {
    //         }
    //     });


  });
};

const displayQuoteButton = async (cartProduct, cartTotalPrice, type) => {
  const getQuote = await api.customApi(
    {
      payload: { shopId: window.shopId, cartProduct, ucCustomerId, type, cartTotalPrice },
    }
  );
  return { ...getQuote.data };
};

const qcGetQuotesDetails = async () => {
  const quCartJson = await ucCartJson("/cart.json").then((quCartResponse) => {
    return quCartResponse;
  });
  if (quCartJson.item_count > 0) {
    const cartTotalPrice = quCartJson.total_price / 100;
    const cartProduct = quCartJson.items;
    const response = await displayQuoteButton(cartProduct, cartTotalPrice, "cart");
    if (response.isDisplayQuoteButton) {
      ucRenderQuotesButton(response.formFields, response.settings,);
    }
  }
};

// const ucRenderAddToQuotesButton = (setting) => {
//   ucAddToQuotesCssEvent(setting);

//   let ucAddToQuotesBtn = `
//     <button class="uc-add-to-quotes-btn" type="button">
//       ${setting?.add_to_cart_btn_text || "Add to Quote"}
//     </button>
//   `;

//   const quoteContainer = document.querySelector(".uc-add-to-quotes");
//   if (!quoteContainer) return;

//   // Inject Quote Button
//   quoteContainer.innerHTML = ucAddToQuotesBtn;

//   let detectedAddToCartBtn = null;

//   // Find actual Add to Cart button inside cart forms
//   document.querySelectorAll('form[action="/cart/add"]').forEach((form) => {
//     let btn = form.querySelector('button[type="submit"]') || form.querySelector(".product-form__submit");

//     if (btn) {
//       detectedAddToCartBtn = btn;

//       // Hide original Add to Cart button if setting enabled
//       if (setting?.is_add_to_cart_quotes == "1") {
//         btn.style.display = "none";
//       }
//     }
//   });

//   // Add click event to Quote button
//   const quoteBtn = document.querySelector(".uc-add-to-quotes-btn");

//   quoteBtn?.addEventListener("click", function () {
//     if (detectedAddToCartBtn) {
//       detectedAddToCartBtn.click();
//     } else {
//       console.warn("Add to Cart button not found");
//     }
//   });

//   // quoteBtn?.addEventListener("click", async function () {
//   //   try {
//   //     // Get current variant ID
//   //     const variantInput = document.querySelector(
//   //       'form[action="/cart/add"] input[name="id"]'
//   //     );

//   //     const quantityInput = document.querySelector('form[action="/cart/add"] input[name="quantity"]');
//   //     const quantity = parseInt(quantityInput?.value || "1", 10);

//   //     if (!variantInput?.value) {
//   //       console.warn("Variant ID not found");
//   //       return;
//   //     }

//   //     const variantId = variantInput.value;

//   //     // Add to cart using Shopify AJAX API
//   //     const response = await fetch("/cart/add.js", {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Accept: "application/json",
//   //       },
//   //       body: JSON.stringify({
//   //         items: [
//   //           {
//   //             id: variantId,
//   //             quantity: quantity,
//   //             properties: {
//   //               "_is_quote": "true",
//   //               "_quote_type": "request_quote",
//   //             },
//   //           },
//   //         ],
//   //       }),
//   //     });

//   //     const data = await response.json();

//   //     console.log("Added to cart:", data);

//   //     // Get updated cart sections (THIS is what theme expects)
//   //     // IMPORTANT: include cart-items section
//   //     const sections = await fetch(
//   //       "/?sections=cart-items,cart-icon-bubble,cart-drawer"
//   //     ).then(res => res.json());

//   //     console.log("Sections:", sections);
//   //     // Safe dispatch
//   //     // document.dispatchEvent(
//   //     //   new CustomEvent("cart:update", {
//   //     //     bubbles: true,
//   //     //     detail: {
//   //     //       sections: sections || {}
//   //     //     }
//   //     //   })
//   //     // );

//   //   } catch (error) {
//   //     console.error("Add to cart failed", error);
//   //   }
//   // });
// };

// const updateCartUI = async () => {
//   try {
//     const cartState = await fetch("/cart.js").then(r => r.json());
//     const itemCount = cartState.item_count;

//     // ============================================================
//     // MOST UNIVERSAL: Direct DOM scan — no section fetching needed
//     // Find cart count element by scanning visible number in DOM
//     // ============================================================
//     let updated = false;

//     // Known cart count selectors across ALL major themes
//     const countSelectors = [
//       // Your theme
//       "#cart-bubble-text",
//       ".cart-bubble__text-count",
//       // Dawn / Sense / Refresh
//       ".cart-count-bubble span:not(.visually-hidden)",
//       // Debut / Simple / Brooklyn
//       "#CartCount",
//       ".cart__count",
//       // Impulse / Turbo
//       ".cart-link__bubble-num",
//       // Broadcast
//       ".header__cart-count",
//       // Prestige
//       ".Cart__ItemCount",
//       // Minimal / Supply
//       "#cart-item-count",
//       ".cart-item-count",
//       // Pipeline
//       ".cart_count",
//       // Venue / Symmetry
//       ".cart-quantity",
//       ".cart-link .count",
//       // Generic
//       "[data-cart-count]",
//       "[data-cart-item-count]",
//       // Your theme specific
//       ".cart-bubble__text-count",
//       "cart-icon-bubble",
//     ];

//     countSelectors.forEach(selector => {
//       try {
//         document.querySelectorAll(selector).forEach(el => {
//           el.textContent = itemCount;
//           el.classList.remove("visually-hidden", "hidden", "is-hidden", "hide");
//           el.removeAttribute("hidden");
//           updated = true;
//           console.log("✅ Updated via selector:", selector, "→", itemCount);
//         });
//       } catch (e) {}
//     });

//     // ============================================================
//     // FALLBACK: Scan entire DOM for cart-related numeric elements
//     // ============================================================
//     if (!updated) {
//       const cartKeywords = ["cart", "Cart", "basket", "Basket", "bag", "Bag", "bubble", "Bubble"];

//       document.querySelectorAll("*").forEach(el => {
//         if (el.children.length > 0) return;

//         const id = el.id || "";
//         const cls = typeof el.className === "string" ? el.className : "";

//         const isCartEl = cartKeywords.some(k => id.includes(k) || cls.includes(k));
//         if (!isCartEl) return;

//         const text = el.textContent.trim();
//         if (/^\d+$/.test(text) || text === "") {
//           el.textContent = itemCount;
//           el.classList.remove("visually-hidden", "hidden", "is-hidden", "hide");
//           el.removeAttribute("hidden");
//           updated = true;
//           console.log("✅ Updated via DOM scan:", el.tagName, id, cls, "→", itemCount);
//         }
//       });
//     }

//     // ============================================================
//     // LAST RESORT: Re-render only the header_section specifically
//     // Use the exact section ID from YOUR theme
//     // ============================================================
//     if (!updated) {
//       try {
//         // Fetch only the header section — not all sections
//         const headerSectionEl = document.querySelector(
//           "[id*='header_section'], [id*='header-section']"
//         );

//         if (headerSectionEl) {
//           const sectionId = headerSectionEl.id.replace("shopify-section-", "");
//           const res = await fetch(`/?sections=${sectionId}`);
//           const data = await res.json();

//           if (data[sectionId]) {
//             const parser = new DOMParser();
//             const newDoc = parser.parseFromString(data[sectionId], "text/html");
//             const newSection = newDoc.querySelector(`#shopify-section-${sectionId}`);

//             if (newSection) {
//               headerSectionEl.innerHTML = newSection.innerHTML;
//               updated = true;
//               console.log("✅ Header section re-rendered");
//             }
//           }
//         }
//       } catch (e) {
//         console.warn("Header section fetch failed:", e);
//       }
//     }

//     console.log(`✅ Cart UI update complete — count: ${itemCount}, updated: ${updated}`);
//     return cartState;

//   } catch (err) {
//     console.error("❌ Cart UI update failed:", err);
//   }
// };

const ucRenderAddToQuotesButtonForContainer = (container, setting, options = {}) => {
  const { inventoryAvailable = true } = options;
  ucAddToQuotesCssEvent(setting);

  const productId = container.getAttribute("data-product-id");
  const variantId = container.getAttribute("data-variant-id")?.trim() || null;

  console.log("variant id render", variantId)

  const soldOutClass = inventoryAvailable ? "" : " uc-add-to-quotes-btn--sold-out";
  const disabledAttrs = inventoryAvailable
    ? ""
    : ' disabled aria-disabled="true"';

  container.innerHTML = `
    <button class="uc-add-to-quotes-btn${soldOutClass}" type="button"${disabledAttrs}>
      <span class="uc-button-text">${setting?.add_to_cart_btn_text || "Add to Quote"}</span>
    </button>
  `;

  const quoteBtn = container.querySelector(".uc-add-to-quotes-btn");
  if (quoteBtn && !inventoryAvailable) {
    quoteBtn.title =
      setting?.sold_out_quote_tooltip || "This product is currently unavailable for purchase.";
  }

  // Hide original Add to Cart only when quote is actionable (sold-out quote keeps ATC visible)
  if (setting?.is_add_to_cart_quotes == "1" && inventoryAvailable) {
    let parent = container.parentElement;
    while (parent && parent !== document.body) {
      const form = parent.querySelector('form[action="/cart/add"]');
      if (form) {
        const btn =
          form.querySelector('button[type="submit"]') ||
          form.querySelector(".product-form__submit");
        if (btn) {
          btn.style.display = "none";
          break;
        }
      }
      parent = parent.parentElement;
    }
  }

  if (!inventoryAvailable || !quoteBtn) {
    return;
  }

  quoteBtn.addEventListener("click", async function () {
    quoteBtn.disabled = true;
    quoteBtn.classList.add("uc-button-loading", "button-loading-spinner");

    try {
      let variantId = ucResolveVariantIdForContainer(container);
      let quantity = 1;

      let parent = container.parentElement;
      while (parent && parent !== document.body) {
        const form = parent.querySelector('form[action="/cart/add"]');
        if (form) {
          const variantInput = form.querySelector('input[name="id"], select[name="id"]');
          const quantityInput = form.querySelector('input[name="quantity"]');
          if (!variantId && variantInput?.value) {
            variantId = variantInput.value.trim();
          }
          quantity = parseInt(quantityInput?.value || "1", 10);
          break;
        }
        parent = parent.parentElement;
      }

      if (!variantId && productId) {
        const handle = container.getAttribute("data-product-handle")?.trim();
        if (handle) {
          const data = await fetchProductDataByHandle(handle);
          variantId =
            data?.variants?.find((v) => v.available)?.id?.toString() ||
            data?.variants?.[0]?.id?.toString() ||
            container.getAttribute("data-default-variant-id")?.trim() ||
            null;
        }
      }

      if (!variantId) {
        console.warn("❌ Variant ID not found for product:", productId);
        quoteBtn.classList.remove("uc-button-loading", "button-loading-spinner");
        quoteBtn.disabled = quoteBtn.classList.contains("uc-add-to-quotes-btn--sold-out");
        return;
      }

      console.log("✅ Adding to cart — variantId:", variantId, "qty:", quantity);

      const cartResponse = await fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: parseInt(variantId, 10),
              quantity: quantity,
              properties: {
                _is_quote: "true",
                _quote_type: "request_quote",
              },
            },
          ],
        }),
      });
      
      const cartData = await cartResponse.json();
      
      if (cartData.status === 422) {
        console.error("Cart error:", cartData.description);
        return;
      }

      await handleAddToQuoteRedirect(setting, cartData);
    } catch (error) {
      console.error("Add to quote cart failed:", error);
    } finally {
      quoteBtn.classList.remove("uc-button-loading", "button-loading-spinner");
      quoteBtn.disabled = quoteBtn.classList.contains("uc-add-to-quotes-btn--sold-out");
    }
  });
};

const ucAddToCartGetQuotesDetails = async () => {
  const allQuoteContainers = document.querySelectorAll(".uc-add-to-quotes");

  if (!allQuoteContainers.length) return;

  const cartProduct = [];
  for (const container of allQuoteContainers) {
    const productId = container.getAttribute("data-product-id");
    if (productId) {
      cartProduct.push({ product_id: productId });
    }
  }
  if (!cartProduct.length) return;

  try {
    const response = await displayQuoteButton(cartProduct, 0, "product");
    const byProduct = response.isDisplayQuoteButtonByProduct || {};

    const uniqueHandles = [
      ...new Set(
        Array.from(allQuoteContainers)
          .map((c) => c.getAttribute("data-product-handle")?.trim())
          .filter(Boolean)
      ),
    ];
    await Promise.all(uniqueHandles.map((h) => fetchProductDataByHandle(h)));

    const settingBase = {
      ...response.settings,
      is_add_to_cart_quotes: response.quoteSetting?.is_add_to_cart_quotes,
    };

    ucQuoteProductSettingsCache = {
      settingBase,
      byProduct,
      showQuote: response.isDisplayQuoteButton,
    };

    for (const container of allQuoteContainers) {
      ucEnsureDefaultVariantId(container);
    }

    for (const container of allQuoteContainers) {
      const productId = container.getAttribute("data-product-id");
      if (!productId) continue;
      const showForProduct = byProduct[productId] ?? response.isDisplayQuoteButton;
      if (!showForProduct) {
        container.innerHTML = "";
        continue;
      }
      await ucRefreshQuoteButtonForContainer(container);
    }
  } catch (err) {
    console.error("Quote button error (batched product check):", err);
  }
};

const ucBindVariantChangeListeners = () => {
  const productForms = document.querySelectorAll('form[action="/cart/add"]');
  if (!productForms.length) return;

  productForms.forEach((form) => {
    const onVariantChange = () => {
      let container =
        form.closest(".product")?.querySelector(".uc-add-to-quotes") ||
        form.parentElement?.querySelector(".uc-add-to-quotes") ||
        form.closest("section")?.querySelector(".uc-add-to-quotes");

      if (!container) return;

      const variantInput = form.querySelector('input[name="id"], select[name="id"]');
      const newVariantId = variantInput?.value?.trim() || null;
      if (newVariantId) {
        container.setAttribute("data-variant-id", newVariantId);
      }

      ucScheduleQuoteButtonsRefresh();
    };

    form.addEventListener("change", (event) => {
      const target = event.target;
      if (
        !target ||
        !(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)
      ) {
        return;
      }

      const name = target.name || "";
      if (
        name === "id" ||
        name.startsWith("options[") ||
        name === "option-0" ||
        name === "option-1" ||
        name === "option-2"
      ) {
        onVariantChange();
      }
    });
  });
};

const ucBindUrlVariantChangeListeners = () => {
  window.addEventListener("popstate", ucScheduleQuoteButtonsRefresh);

  const wrapHistoryMethod = (method) => {
    const original = history[method];
    if (typeof original !== "function") return;
    history[method] = function (...args) {
      const result = original.apply(this, args);
      ucScheduleQuoteButtonsRefresh();
      return result;
    };
  };

  wrapHistoryMethod("pushState");
  wrapHistoryMethod("replaceState");

  document.addEventListener("variant:change", (event) => {
    const detail = event?.detail;
    const variantId =
      detail?.variant?.id?.toString() ||
      detail?.id?.toString() ||
      ucGetUrlVariantId();

    if (!variantId) {
      ucScheduleQuoteButtonsRefresh();
      return;
    }

    document.querySelectorAll(".uc-add-to-quotes").forEach((container) => {
      container.setAttribute("data-variant-id", variantId);
    });
    ucScheduleQuoteButtonsRefresh();
  });
};

// Wait for the DOM to be fully loaded before executing any code
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelectorAll(".uc-add-to-quotes").length) {
    ucAddToCartGetQuotesDetails();
    ucBindVariantChangeListeners();
    ucBindUrlVariantChangeListeners();
  }
  window.qcCallQuotesDetails();
});
window.qcCallQuotesDetails = function () {
  if (document.querySelectorAll(".uc-request-quotes").length) {
    qcGetQuotesDetails();
  }
}
