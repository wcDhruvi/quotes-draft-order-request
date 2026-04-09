import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState, useMemo, useCallback } from 'preact/hooks';
import { GADGET_CONFIG } from '../../shared/config.js';
import moment from 'moment';

// GraphQL Queries
const GET_CUSTOMER_QUOTES = `
  mutation getCustomerQuotes($customerId: String!) {
    getCustomerQuotes(customerId: $customerId) {
      success
      errors {
        message
      }
      result
    }
  }
`;

export default async () => {
  render(<Extension />, document.body)
}

const STATUS_MAP = {
  'open': { label: 'Open', tone: 'neutral' },
  'invoice_sent': { label: 'Invoice Sent', tone: 'info' },
  'completed': { label: 'Completed', tone: 'auto' },
};

const getStatusDetails = (status) => {
  return STATUS_MAP[status] || { label: status || 'open', tone: 'neutral' };
};

function Extension() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const quotesPerPage = 10;

  // Use shopify global context
  const customerId = shopify?.authenticatedAccount?.customer?.value?.id?.replace('gid://shopify/Customer/', '');

  const fetchQuotes = useCallback(async () => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(GADGET_CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_CUSTOMER_QUOTES,
          variables: { customerId: customerId.toString() }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error('GraphQL mapping errors:', data.errors);
      } else {
        const responseData = data.data?.getCustomerQuotes;
        if (responseData?.success) {
          setQuotes(responseData.result || []);
        } else {
          console.error('Action errors:', responseData?.errors);
        }
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Derived state: Filtered quotes based on search and status
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const matchesSearch = (quote.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quote.draftOrder?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const draftStatus = quote.draftOrder?.status || 'Processing';
      const matchesStatus = statusFilter === '' || draftStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, statusFilter]);

  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * quotesPerPage;
    return filteredQuotes.slice(startIndex, startIndex + quotesPerPage);
  }, [filteredQuotes, currentPage]);

  const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage);

  const formatCurrency = (amount, currency) => {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100);
  };

  // Get defined statuses for the filter
  const statuses = useMemo(() => {
    return ['All', ...Object.keys(STATUS_MAP)];
  }, []);

  return (
    <s-stack direction="block" gap="base">
      <s-stack direction="block" gap="none">
        <s-heading>My Quote Requests</s-heading>
        <s-text color="subdued">Manage and view the status of your submitted quotes.</s-text>
      </s-stack>

      <s-section>
        {/* Search and Filter Row */}
        <s-stack direction="inline" gap="base" alignItems="end" paddingBlockEnd="base" justifyContent='end'>
          <s-text-field
            label="Search by Name"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setCurrentPage(1);
            }}
          />
          <s-select
            label="Filter by Status"
            value={statusFilter || 'All'}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setStatusFilter(val === 'All' ? '' : val);
              setCurrentPage(1);
            }}
          >
            {statuses.map(status => (
              <s-option key={status} value={status}>
                {status === 'All' ? 'All' : (STATUS_MAP[status]?.label || status)}
              </s-option>
            ))}
          </s-select>
        </s-stack>

        {/* Header Row */}
        <s-stack
          direction="block"
          gap="small-200"
          padding="base"
          borderWidth="none none base none"
          borderStyle="none none solid none"
        >
          <s-grid gridTemplateColumns="20% 15% 15% 20% 25%" gap="small-200" alignItems="center">
            <s-grid-item><s-text type="strong">Quote Name</s-text></s-grid-item>
            <s-grid-item><s-text type="strong">Subtotal</s-text></s-grid-item>
            <s-grid-item><s-text type="strong">Total</s-text></s-grid-item>
            <s-grid-item><s-text type="strong">Status</s-text></s-grid-item>
            <s-grid-item><s-text type="strong">Date</s-text></s-grid-item>
          </s-grid>
        </s-stack>

        {loading ? (
          <s-stack direction="inline" gap="base" alignItems="center" justifyContent="center" padding="base">
            <s-spinner />
            <s-text>Loading Quotes...</s-text>
          </s-stack>
        ) : filteredQuotes.length > 0 ? (
          <s-stack direction="block" gap="none">
            {paginatedQuotes.map((quote) => (
              <s-stack
                key={quote.id}
                direction="block"
                gap="small-200"
                padding="base"
                borderWidth="none none base none"
                borderStyle="none none solid none"
              >
                <s-grid gridTemplateColumns="20% 15% 15% 20% 20% 5%" gap="small-200" alignItems="center">
                  <s-grid-item>
                    <s-text type="strong">
                      {quote.name || quote.draftOrder?.name || `Quote #${quote.id}`}
                    </s-text>
                  </s-grid-item>
                  <s-grid-item>
                    <s-text>{formatCurrency(quote.order_detail?.items_subtotal_price, quote.order_detail?.currency)}</s-text>
                  </s-grid-item>
                  <s-grid-item>
                    <s-text>{formatCurrency(quote.order_detail?.total_price, quote.order_detail?.currency)}</s-text>
                  </s-grid-item>
                  <s-grid-item>
                    {(() => {
                      const details = getStatusDetails(quote.draftOrder?.status);
                      return (
                        <s-badge tone={details.tone}>
                          {details.label}
                        </s-badge>
                      );
                    })()}
                  </s-grid-item>
                  <s-grid-item>
                    <s-text>{moment(quote.createdAt).format('MMM DD, YYYY')}</s-text>
                  </s-grid-item>
                  <s-grid-item>
                    <s-clickable

                      command="--show"
                      commandFor="quote-view-modal"
                      onClick={() => setSelectedQuote(quote)}
                    >
                      <s-text type="strong" tone="custom">  View</s-text>
                    </s-clickable>
                  </s-grid-item>
                </s-grid>
              </s-stack>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <s-stack direction="inline" justifyContent="center" gap="base" padding="base" alignItems='center'>
                <s-button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  <s-icon type="chevron-left" />
                </s-button>
                <s-text>Page {currentPage} of {totalPages}</s-text>

                <s-button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                  <s-icon type="chevron-right" />
                </s-button>
              </s-stack>
            )}
          </s-stack>
        ) : (
          <s-stack direction="block" padding="base" alignItems="center" justifyContent="center">
            <s-text color="subdued">
              {searchQuery || statusFilter ? 'No results match your criteria.' : 'No quotes found.'}
            </s-text>
          </s-stack>
        )}

        <s-modal
          id="quote-view-modal"
          size="large"
          heading={
            selectedQuote
              ? (selectedQuote.name ||
                selectedQuote.draftOrder?.name ||
                `Quote #${selectedQuote.id}`)
              : ''
          }
        >
          {selectedQuote && (
            <s-stack direction="block" gap="large">

              <s-stack direction="inline" gap="base">
                <s-text type="strong">
                  Status:
                </s-text>
                <s-badge tone={getStatusDetails(selectedQuote.draftOrder?.status).tone}>
                  {getStatusDetails(selectedQuote.draftOrder?.status).label}
                </s-badge>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text type="strong">
                  Note:
                </s-text>
                <s-text>{selectedQuote?.customer_detail?.note || "—"}</s-text>
              </s-stack>
              {/* Line Items */}
              <s-stack gap="base" >
                <s-text type="strong">Line Items</s-text>

                <s-box padding="small" background="subdued"
                  borderRadius="small"
                >

                  {/* Header */}
                  <s-grid
                    gridTemplateColumns="4fr 1fr 1fr 1fr"
                    gap="small-200"
                    alignItems="center"
                    paddingBlockEnd="small-200"
                  >
                    <s-text>Product</s-text>
                    <s-text >Price</s-text>
                    <s-text >Qty</s-text>
                    <s-stack justifyContent='end' alignItems='end'><s-text >Total</s-text></s-stack>
                  </s-grid>

                  <s-divider />

                  {/* Items */}
                  {selectedQuote.order_detail?.items?.map((item, index) => (
                    <s-stack
                      key={index}
                      direction="block"
                      gap="small-200"
                      paddingBlock="small-200"
                      borderWidth="none none base none"
                      borderStyle="none none solid none"
                    >
                      <s-grid
                        gridTemplateColumns="4fr 1fr 1fr 1fr"
                        gap="small-200"
                        alignItems="center"
                      >
                        {/* Product */}
                        <s-grid-item>
                          <s-stack
                            direction="inline"
                            gap="small-200"
                            alignItems='center'
                          >

                            {/* Thumbnail (fixed size) */}
                            {item.image && (
                              <s-product-thumbnail
                                size="small-100"
                                src={item.image}
                              />
                            )}

                            {/* Text container */}
                            <s-stack direction="block" justifyContent='center' alignItems='center'>
                              <s-text>{item.title}</s-text>
                            </s-stack>
                          </s-stack>
                        </s-grid-item>

                        {/* Price */}
                        <s-grid-item>
                          <s-text >
                            {formatCurrency(item.price, selectedQuote.order_detail?.currency)}
                          </s-text>
                        </s-grid-item>

                        {/* Qty */}
                        <s-grid-item>
                          <s-text >{item.quantity}</s-text>
                        </s-grid-item>

                        {/* Total */}
                        <s-grid-item >
                          <s-stack justifyContent='end' alignItems='end'>
                            <s-text>
                              {formatCurrency(
                                item.quantity * item.price,
                                selectedQuote.order_detail?.currency
                              )}
                            </s-text>
                          </s-stack>
                        </s-grid-item>
                      </s-grid>
                    </s-stack>
                  ))}

                  <s-grid
                    gridTemplateColumns="1fr auto"
                    alignItems="center"
                    paddingBlock="small-200"
                    borderWidth="none none base none"
                    borderStyle="none none solid none"
                  >
                    <s-text>Sub Total</s-text>

                    <s-text>
                      {formatCurrency(
                        selectedQuote.order_detail?.items_subtotal_price,
                        selectedQuote.order_detail?.currency
                      )}
                    </s-text>
                  </s-grid>

                  {/* Total */}
                  <s-grid
                    gridTemplateColumns="1fr auto"
                    alignItems="center"
                    paddingBlock="small-200"
                  >
                    <s-text type="strong">
                      Total
                    </s-text>

                    <s-text type="strong">
                      {formatCurrency(
                        selectedQuote.order_detail?.total_price,
                        selectedQuote.order_detail?.currency
                      )}
                    </s-text>
                  </s-grid>
                </s-box>
              </s-stack>



            </s-stack>
          )}
        </s-modal>
      </s-section>
    </s-stack>
  )
}
