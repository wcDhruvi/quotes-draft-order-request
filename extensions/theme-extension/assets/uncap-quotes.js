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
    ucCss += `.uc-button-loading::after{border-color: ${setting.quote_submit_button_color};}`;
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
      payload: { shopId: window.shopId, cartProduct, ucCustomerId, type },
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

const ucRenderAddToQuotesButton = (setting) => {
  ucAddToQuotesCssEvent(setting);
  let ucAddToQuotesBtn = "";
  ucAddToQuotesBtn +=
    '<button class="uc-add-to-quotes-btn" type="button">' +
    setting?.add_to_cart_btn_text +
    "</button>";
  if (document.querySelector(".uc-add-to-quotes")) {
    document.querySelector(".uc-add-to-quotes").innerHTML = ucAddToQuotesBtn;
    document.querySelector(".uc-add-to-quotes-btn").addEventListener("click", function (e) {
      document.querySelector(".product-form__submit").click();
    });
    if (setting.is_add_to_cart_quotes == "1") {
      document.querySelectorAll('form[action="/cart/add"]')
        .forEach(function (this_loop) {
          if (this_loop.querySelector('button[type="submit"]') || this_loop.querySelector(".product-form__submit")) {
            let add_to_cart_btn = this_loop.querySelector('button[type="submit"]') ? this_loop.querySelector('button[type="submit"]') : "";
            if (add_to_cart_btn || add_to_cart_btn.innerText == "add to cart") {
              add_to_cart_btn.style.display = "none";
            }
            this_loop.querySelector(".product-form__submit")
              ? (this_loop.querySelector(".product-form__submit").style.display =
                "none")
              : "";
          }
        });
    }

  }
};

const ucAddToCartGetQuotesDetails = async () => {
  const response = await displayQuoteButton([{ product_id: __st.rid }], 0, "product");
  if (response.isDisplayQuoteButton) {
    ucRenderAddToQuotesButton({ ...response.settings, is_add_to_cart_quotes: response.quoteSetting.is_add_to_cart_quotes },);
  }
};
// Wait for the DOM to be fully loaded before executing any code
document.addEventListener("DOMContentLoaded", function () {
  if (ucPage === "product") {
    if (document.querySelectorAll(".uc-add-to-quotes").length) {
      ucAddToCartGetQuotesDetails();
    }
  }
  window.qcCallQuotesDetails();
});
window.qcCallQuotesDetails = function () {
  if (document.querySelectorAll(".uc-request-quotes").length) {
    qcGetQuotesDetails();
  }
}
