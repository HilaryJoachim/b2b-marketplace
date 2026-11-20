import { NextResponse } from 'next/server';

export type Message = {
  id: string;
  sender: 'buyer' | 'seller' | 'system';
  timestamp: string;
  type: 'text' | 'product_inquiry';
  content?: string;
  product?: {
    id: number;
    title: string;
    category: string;
    specs: string;
    targetPrice: string;
    qty: string;
  };
};

export type Lead = {
  id: number;
  name: string;
  location: string;
  email: string;
  phone: string;
  date: string;
  unreadCount: number;
  avatarColor: string;
  initials: string;
  isOnline: boolean;
  messages: Message[];
};

// In-memory mock database
const MOCK_DB: Record<number, Lead> = {
  1: {
    id: 1,
    name: 'Vishal',
    location: 'Chhindwara, Madhya Pradesh',
    email: 'vishal.buyer@example.com',
    phone: '+91 98765 43210',
    date: 'Yesterday',
    unreadCount: 2,
    avatarColor: 'bg-teal-100 text-teal-700',
    initials: 'V',
    isOnline: true,
    messages: [
      {
        id: 'm1',
        sender: 'buyer',
        timestamp: 'Yesterday, 2:30 PM',
        type: 'product_inquiry',
        product: {
          id: 101,
          title: 'ECOSURE FULLY AUTOMATIC MACHINE',
          category: 'Pulp Moulding Machinery',
          specs: 'Model No. ECOFA12085-60T, Standard Capacity',
          targetPrice: '$15,000',
          qty: '2 Units'
        }
      },
      {
        id: 'm2',
        sender: 'buyer',
        timestamp: 'Yesterday, 2:31 PM',
        type: 'text',
        content: 'Hi, can you provide additional details for the Automation Grade Fully Automatic machine? We are looking for immediate shipment.'
      },
      {
        id: 'm3',
        sender: 'buyer',
        timestamp: 'Yesterday, 2:32 PM',
        type: 'text',
        content: 'Also, does this include installation?'
      }
    ]
  },
  2: {
    id: 2,
    name: 'Sushen Sharma',
    location: 'Jamshedpur, Jharkhand',
    email: 'sushen@manufacturing-hub.in',
    phone: '+91 87654 32109',
    date: '5/8/26',
    unreadCount: 0,
    avatarColor: 'bg-blue-100 text-blue-700',
    initials: 'S',
    isOnline: false,
    messages: [
      {
        id: 'm4',
        sender: 'buyer',
        timestamp: '5/8/26, 10:15 AM',
        type: 'text',
        content: 'I am interested in ECOSURE SEMI AUTOMATIC SAMPLING MACHINE. Can you share the spec sheet?'
      },
      {
        id: 'm5',
        sender: 'seller',
        timestamp: '5/8/26, 10:45 AM',
        type: 'text',
        content: 'Hello Sushen! Yes, we have attached the specifications on the product page. Let me know if you need anything else.'
      }
    ]
  },
  3: {
    id: 3,
    name: 'Khatushyamorganicfoods',
    location: 'Nagpur, Maharashtra',
    email: 'contact@khatushyam.com',
    phone: '+91 91234 56789',
    date: '16/7/26',
    unreadCount: 0,
    avatarColor: 'bg-gray-200 text-gray-700',
    initials: 'K',
    isOnline: false,
    messages: [
      {
        id: 'm6',
        sender: 'buyer',
        timestamp: '16/7/26, 9:00 AM',
        type: 'text',
        content: 'I am interested in Thermoforming Machines.'
      }
    ]
  }
};

export async function GET() {
  // Convert object to array and return
  const leads = Object.values(MOCK_DB);
  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  try {
    const { leadId, message, senderType = 'seller' } = await request.json();
    
    if (MOCK_DB[leadId]) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: senderType,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        content: message
      };
      
      MOCK_DB[leadId].messages.push(newMessage);
      
      // Clear unread count only if seller is responding (since this view primarily tracks buyer messages for the seller right now)
      if (senderType === 'seller') {
        MOCK_DB[leadId].unreadCount = 0;
      }
      
      return NextResponse.json({ success: true, message: newMessage });
    }
    
    return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
