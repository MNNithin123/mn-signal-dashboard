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
  return property?.title?.[0]?.plain_text
    || property?.rich_text?.[0]?.plain_text
    || undefined;
}

function mapNotionPage(page: any): Lead {
  const props = page.properties ?? {};
  const values = Object.values(props) as any[];

  const nameProp = props['Full Name'] || props['Name'] || props['Title'] || values.find((p: any) => p?.type === 'title');
  const emailProp = props['Email'] || props['E-mail'] || values.find((p: any) => p?.type === 'email');
  const phoneProp = props['Phone Number'] || props['Phone'] || values.find((p: any) => p?.type === 'phone_number');
  const interestProp = props['Buying/Selling or Property Interest'] || props['Interest'] || props['Property Interest'] || props['Type'];
  const dateProp = props['Date Captured'] || props['Date'] || values.find((p: any) => p?.type === 'date');
  const statusProp = props['Status'] || values.find((p: any) => p?.type === 'status' || p?.type === 'select');
  const budgetProp = props['Budget'];

  const name = readPlainText(nameProp) || 'Unnamed Lead';
  const email = emailProp?.email || readPlainText(emailProp) || 'No email';
  const phone = phoneProp?.phone_number || readPlainText(phoneProp) || 'No phone';

  let interest = 'General Inquiry';
  if (interestProp?.select?.name) interest = interestProp.select.name;
  else if (interestProp?.status?.name) interest = interestProp.status.name;
  else if (readPlainText(interestProp)) interest = readPlainText(interestProp)!;
  else if (interestProp?.multi_select?.length) interest = interestProp.multi_select.map((item: any) => item.name).join(', ');

  const rawDate = dateProp?.date?.start || page.created_time;
  const parsedDate = rawDate ? new Date(rawDate) : new Date();
  const dateCaptured = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString().slice(0, 10)
    : parsedDate.toISOString().slice(0, 10);

  let status: Lead['status'] = 'New';
  const rawStatus = statusProp?.status?.name || statusProp?.select?.name || '';
  if (/contact/i.test(rawStatus)) status = 'Contacted';
  else if (/qualif/i.test(rawStatus)) status = 'Qualified';
  else if (/clos|sold|won/i.test(rawStatus)) status = 'Closed';
  else if (/new/i.test(rawStatus)) status = 'New';

  let budget: string | undefined;
  if (typeof budgetProp?.number === 'number') budget = `$${budgetProp.number.toLocaleString('en-US')}`;
  else if (readPlainText(budgetProp)) budget = readPlainText(budgetProp);

  return { id: page.id, name, email, phone, interest, dateCaptured, status, budget };
}

export async function fetchNotionLeads(): Promise<Lead[]> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    throw new Error('Missing Notion environment configuration.');
  }

  const notion = new Client({ auth: apiKey });
  const allPages: any[] = [];
  let startCursor: string | undefined;

  // Notion returns at most 100 records per request. Follow cursors so the
  // dashboard doesn't silently omit leads when a database grows.
  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      page_size: 100,
      ...(startCursor ? { start_cursor: startCursor } : {}),
    });

    allPages.push(...response.results);
    startCursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (startCursor);

  return allPages.map(mapNotionPage);
}
