
import { Client } from '@notionhq/client';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  dateCaptured: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Closed';
  budget?: string;
}

function readPlainText(property: any): string | undefined {
  return property?.title?.map((item: any) => item.plain_text).join('')
    || property?.rich_text?.map((item: any) => item.plain_text).join('')
    || undefined;
}

function mapNotionPage(page: any): Lead {
  const props = page.properties ?? {};
  const values = Object.values(props) as any[];

  const nameProp =
    props['Name'] ||
    props['Full Name'] ||
    values.find((p: any) => p?.type === 'title');

  const emailProp =
    props['Email'] ||
    values.find((p: any) => p?.type === 'email');

  const phoneProp =
    props['Phone'] ||
    props['Phone Number'] ||
    values.find((p: any) => p?.type === 'phone_number');

  const interestProp =
    props['Buy / Sell'] ||
    props['Property Interest'] ||
    props['Interest'] ||
    props['Message'];

  const dateProp = props['Date'];
  const statusProp = props['Status'];
  const budgetProp = props['Budget'];

  const name = readPlainText(nameProp) || 'Unnamed Lead';
  const email = emailProp?.email || readPlainText(emailProp) || 'No email';
  const phone =
    phoneProp?.phone_number || readPlainText(phoneProp) || 'No phone';

  let interest = 'General Inquiry';
  if (interestProp?.select?.name) {
    interest = interestProp.select.name;
  } else if (interestProp?.status?.name) {
    interest = interestProp.status.name;
  } else if (readPlainText(interestProp)) {
    interest = readPlainText(interestProp)!;
  }

  const rawDate = readPlainText(dateProp) || page.created_time;
  const parsedDate = new Date(rawDate);
  const dateCaptured = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString().slice(0, 10)
    : parsedDate.toISOString().slice(0, 10);

  const rawStatus =
    statusProp?.status?.name || statusProp?.select?.name || '';

  let status: Lead['status'] = 'New';
  if (/contact|progress/i.test(rawStatus)) status = 'Contacted';
  else if (/qualif/i.test(rawStatus)) status = 'Qualified';
  else if (/clos|sold|won|done/i.test(rawStatus)) status = 'Closed';

  const budget = readPlainText(budgetProp);

  return {
    id: page.id,
    name,
    email,
    phone,
    interest,
    dateCaptured,
    status,
    budget,
  };
}

export async function fetchNotionLeads(): Promise<Lead[]> {
  const apiKey = process.env.NOTION_API_KEY;
  const dataSourceId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !dataSourceId) {
    throw new Error('Missing Notion environment configuration.');
  }

  const notion = new Client({ auth: apiKey });
  const allPages: any[] = [];
  let startCursor: string | undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      ...(startCursor ? { start_cursor: startCursor } : {}),
    });

    allPages.push(...response.results);
    startCursor = response.has_more
      ? response.next_cursor ?? undefined
      : undefined;
  } while (startCursor);

  return allPages.map(mapNotionPage);
}
