
export const run = async ({ api, logger }) => {
  logger.info("Starting migration: Link quotes to shopifyDraftOrder...");

  let count = 0;
  let skipped = 0;
  let errors = 0;


  // Process all quotes in batches
  let quotesPage = await api.quotes.findMany({
    select: { id: true, draft_order_id: true, draftOrder: { id: true } },
    first: 250
  });

  while (true) {
    for (const quote of quotesPage) {
      if (quote.draft_order_id && !quote.draftOrder?.id) {
        try {
          // Attempt to link. This assumes the shopifyDraftOrder record exists with the same ID.
          await api.quotes.update(quote.id, {
            draftOrder: { _link: quote.draft_order_id }
          });
          count++;
        } catch (err) {
          logger.error(`Failed to link quote ${quote.id} to draft order ${quote.draft_order_id}: ${err.message}`);
          errors++;
        }
      } else {
        skipped++;
      }
    }

    if (quotesPage.hasNextPage) {
      quotesPage = await quotesPage.nextPage();
    } else {
      break;
    }
  }

  logger.info(`Migration complete. Linked: ${count}, Already linked/No ID: ${skipped}, Errors: ${errors}`);
  return { linked: count, skipped, errors };
};

export const options = {
  triggers: { api: true },
};
