'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft, Loader2, Package, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { messagesApi, usersApi, productsApi } from '@/lib/api';
import { getOrderForms, setOrderForms } from '@/lib/local-storage-utils';
import type {
  Message,
  MessageThread,
  Product,
  User,
  Order,
  OrderForm,
} from '@/lib/types';

// Enhanced Order Form Modal Component (inline to avoid import issues)
function EnhancedOrderFormModal({
  product,
  sellerId,
  buyerId,
  onSubmit,
  onCancel,
}: {
  product: Product;
  sellerId: string;
  buyerId: string;
  onSubmit: (orderForm: Order) => void;
  onCancel: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(product.price);

  useEffect(() => {
    setTotalPrice(quantity * product.price);
  }, [quantity, product.price]);

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 1;
    const maxQuantity = Math.min(numValue, product.quantity);
    setQuantity(Math.max(1, maxQuantity));
  };

  const handleSubmit = () => {
    const orderForm: OrderForm = {
      id: generateId(),
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.images[0],
      productDescription: product.description,
      quantity,
      totalPrice,
      sellerId,
      buyerId,
      status: 'pending',
      createdAt: Date.now(),
    };
    onSubmit(orderForm);
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-bold text-agronetGreen flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Create Order Form
          </h3>
          <Button variant='ghost' size='icon' onClick={onCancel}>
            <X className='h-4 w-4' />
          </Button>
        </div>

        <div className='space-y-4'>
          {/* Product Info */}
          <div className='flex gap-3'>
            <div className='relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100'>
              <img
                src={product.images[0] || '/placeholder.svg?height=64&width=64'}
                alt={product.name}
                className='w-full h-full object-cover'
              />
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='font-semibold text-gray-900 truncate'>
                {product.name}
              </h4>
              <p className='text-sm text-gray-600 line-clamp-2'>
                {product.description}
              </p>
              <p className='text-lg font-bold text-agronetGreen'>
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>

          <hr className='border-gray-200' />

          {/* Quantity Input */}
          <div className='space-y-2'>
            <label htmlFor='quantity' className='text-sm font-medium'>
              Quantity (Available: {product.quantity})
            </label>
            <Input
              id='quantity'
              type='number'
              min='1'
              max={product.quantity}
              value={quantity}
              onChange={e => handleQuantityChange(e.target.value)}
              className='w-full'
            />
          </div>

          {/* Total Price */}
          <div className='bg-agronetGreen/10 p-4 rounded-lg'>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-medium text-agronetGreen'>
                Total Price
              </span>
              <p className='text-2xl font-bold text-agronetGreen'>
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className='flex gap-2 pt-4'>
            <Button variant='outline' onClick={onCancel} className='flex-1'>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className='flex-1 bg-agronetGreen hover:bg-agronetGreen/90'>
              Send Order Form
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  // Next router sometimes passes the literal string 'undefined' for missing params.
  // Normalize so 'undefined' or 'null' become actual undefined.
  const rawId = params.id as string | undefined;
  const chatId =
    rawId && (rawId === 'undefined' || rawId === 'null') ? undefined : rawId;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  console.log('ChatPage params:', params);
  console.log('ChatId:', chatId);
  if (rawId === 'undefined' || rawId === 'null') {
    console.warn('Received string literal for id param:', rawId);
  }

  // States for chat data
  const [chat, setChat] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherParticipant, setOtherParticipant] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // States for order functionality
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  // Order forms state (persisted in local storage helpers)
  const [orderForms, setOrderFormsState] = useState<OrderForm[]>(() => {
    try {
      return getOrderForms() || [];
    } catch (err) {
      return [];
    }
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // All useEffect hooks
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to view chats.',
        variant: 'destructive',
      });
      return;
    }

    if (!chatId) {
      toast({
        title: 'Invalid Chat',
        description: 'Chat ID is missing from the URL.',
        variant: 'destructive',
      });
      router.push('/chats');
      return;
    }

    async function fetchOrInitializeChat() {
      if (!user) return;

      try {
        setLoading(true);
        let thread = null;

        // First, try to get existing thread by ID (if chatId is a valid ObjectId)
        if (
          chatId &&
          chatId.length === 24 &&
          /^[0-9a-fA-F]{24}$/.test(chatId)
        ) {
          try {
            const threadData = await messagesApi.getThread(chatId);
            if (threadData.success && threadData.data) {
              thread = threadData.data;
            }
          } catch (error) {
            console.log('Thread not found by ID, will try to create new one');
          }
        }

        // If no thread found and chatId contains a dash, try to create from buyerId-farmerId format
        if (!thread && chatId && chatId.includes('-')) {
          const [buyerId, farmerId] = chatId.split('-');
          if (buyerId && farmerId) {
            try {
              const createResponse = await messagesApi.createThread({
                buyerId,
                farmerId,
              });
              if (createResponse.success && createResponse.data) {
                thread = createResponse.data;
              }
            } catch (createError) {
              console.error(
                'Error creating thread from participants:',
                createError,
              );
            }
          }
        }

        console.log('thread', thread);

        if (!thread) {
          throw new Error(
            `Unable to initialize chat. Invalid chat ID format: ${chatId}`,
          );
        }

        console.log('Thread data:', thread);
        console.log('Current user:', user);

        // Set chat and fetch related data
        setChat(thread);

        // Helper to fetch and normalize messages from server
        const fetchAndSetMessages = async () => {
          const messagesResponse = await messagesApi.getThreadMessages(
            thread._id,
          );
          console.log(
            'messagesResponse for thread',
            thread._id,
            messagesResponse,
          );
          if (messagesResponse && (messagesResponse as any).success) {
            const normalized = (messagesResponse.data || []).map(m => ({
              ...m,
              senderId:
                typeof (m as any).senderId === 'object'
                  ? (m as any).senderId._id
                  : (m as any).senderId,
              receiverId:
                typeof (m as any).receiverId === 'object'
                  ? (m as any).receiverId._id
                  : (m as any).receiverId,
            }));
            setMessages(normalized as Message[]);
          }
        };

        // Initial fetch
        await fetchAndSetMessages();

        // Resolve buyer/farmer IDs (handle populated objects) and fetch the
        // other participant from the users API to ensure a consistent shape.
        const buyerIdStr =
          typeof thread.buyerId === 'object'
            ? thread.buyerId._id || ''
            : thread.buyerId;
        const farmerIdStr =
          typeof thread.farmerId === 'object'
            ? thread.farmerId._id || ''
            : thread.farmerId;

        const otherParticipantId =
          buyerIdStr === user._id ? farmerIdStr : buyerIdStr;
        if (otherParticipantId) {
          const userResponse = await usersApi.getUser(otherParticipantId);
          console.log(
            'otherParticipant fetch:',
            otherParticipantId,
            userResponse,
          );

          // usersApi.getUser historically returned a raw User object, but some
          // admin/debug endpoints may return ApiResponse<User>. Accept both.
          let participant: any = null;
          if (userResponse) {
            if ((userResponse as any).success && (userResponse as any).data) {
              participant = (userResponse as any).data;
            } else if ((userResponse as any)._id) {
              participant = userResponse;
            }
          }

          if (participant) {
            setOtherParticipant(participant as User);
          } else {
            console.warn(
              'Unable to resolve other participant from response:',
              userResponse,
            );
            // Fallback: if thread has populated buyerId/farmerId objects, use them
            try {
              const buyerObj: any =
                typeof thread.buyerId === 'object' ? thread.buyerId : null;
              const farmerObj: any =
                typeof thread.farmerId === 'object' ? thread.farmerId : null;
              const fallback =
                buyerObj && buyerObj._id !== user._id
                  ? buyerObj
                  : farmerObj && farmerObj._id !== user._id
                  ? farmerObj
                  : null;
              if (fallback) {
                console.log(
                  'Using thread-populated participant as fallback:',
                  fallback,
                );
                setOtherParticipant(fallback as User);
              } else {
                // Final fallback: create a minimal placeholder participant so the
                // UI can render immediately. Details can be filled later when
                // a subsequent fetch returns proper data.
                const placeholder = {
                  _id: otherParticipantId,
                  firstname: '',
                  lastname: '',
                  email: '',
                } as any;
                console.log(
                  'Using placeholder participant for id:',
                  otherParticipantId,
                );
                setOtherParticipant(placeholder as User);
              }
            } catch (err) {
              console.warn('Fallback participant resolution failed:', err);
            }
          }
        }

        // Load seller products if applicable
        if (user.role === 'farmer') {
          try {
            const response = await productsApi.getProducts();
            if (response.success) {
              const products =
                response.data?.filter(p => p.sellerId === user._id) || [];
              setSellerProducts(products);
            }
          } catch (err) {
            console.error('Error loading products:', err);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize chat. Please try again.',
          variant: 'destructive',
        });
        router.push('/chats');
      }
    }

    fetchOrInitializeChat();
  }, [chatId, isAuthenticated, user, authLoading, router, toast]);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // All handler functions
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat || !user || !otherParticipant) return;

    try {
      const messageData = {
        threadId: chat._id,
        receiverId: otherParticipant._id,
        content: newMessage.trim(),
      };

      const response = await messagesApi.createMessage(messageData);

      console.log('createMessage response:', response);

      if (response && response.success && response.data) {
        // Normalize created message to ensure senderId/receiverId are strings
        const created = {
          ...response.data,
          senderId:
            typeof (response.data as any).senderId === 'object'
              ? (response.data as any).senderId._id
              : (response.data as any).senderId,
          receiverId:
            typeof (response.data as any).receiverId === 'object'
              ? (response.data as any).receiverId._id
              : (response.data as any).receiverId,
        } as Message;

        // Re-fetch messages from server to reflect persisted state
        try {
          const fresh = await messagesApi.getThreadMessages(chat._id);
          if (fresh && (fresh as any).success) {
            const normalized = (fresh.data || []).map(m => ({
              ...m,
              senderId:
                typeof (m as any).senderId === 'object'
                  ? (m as any).senderId._id
                  : (m as any).senderId,
              receiverId:
                typeof (m as any).receiverId === 'object'
                  ? (m as any).receiverId._id
                  : (m as any).receiverId,
            }));
            setMessages(normalized as Message[]);
          } else {
            // Fallback to optimistic append
            setMessages(prev => [...prev, created]);
          }
        } catch (err) {
          console.warn('Failed to refresh messages after send:', err);
          setMessages(prev => [...prev, created]);
        }

        setNewMessage('');

        // Scroll to bottom
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatTimestamp = (timestamp: string | number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendOrderForm = () => {
    // Get all products if seller has none assigned
    let availableProducts = sellerProducts;
    if (availableProducts.length === 0) {
      availableProducts = getProducts().filter(p => p.sellerId === user?.id);
    }

    // If still no products, create a default product for demo
    if (availableProducts.length === 0) {
      const defaultProduct: Product = {
        id: generateId(),
        name: 'Sample Product',
        description: 'This is a sample product for demonstration',
        price: 10.0,
        quantity: 100,
        image: '/placeholder.svg?height=400&width=600',
        sellerId: user?.id || '',
        category: 'General',
      };
      availableProducts = [defaultProduct];
    }

    setSelectedProduct(availableProducts[0]);
    setShowOrderForm(true);
  };

  const handleOrderFormSubmit = (orderForm: OrderForm) => {
    const allOrderForms = getOrderForms() || [];
    allOrderForms.push(orderForm);
    setOrderForms(allOrderForms);
    setOrderFormsState([...orderForms, orderForm]);
    setShowOrderForm(false);
    setSelectedProduct(null);

    toast({
      title: 'Order Form Sent!',
      description: 'Your order form has been sent to the buyer.',
      variant: 'default',
    });
  };

  const handleOrderFormCancel = () => {
    setShowOrderForm(false);
    setSelectedProduct(null);
  };

  const handleAcceptOrderForm = (orderFormId: string) => {
    console.log('Accepting order form:', orderFormId);

    const allOrderForms = getOrderForms() || [];
    const updatedOrderForms = allOrderForms.map(form =>
      form.id === orderFormId ? { ...form, status: 'accepted' as const } : form,
    );

    setOrderForms(updatedOrderForms);

    // Update local state
    const filteredForms = updatedOrderForms.filter(
      form =>
        (form.sellerId === user?.id && form.buyerId === otherParticipant?.id) ||
        (form.buyerId === user?.id && form.sellerId === otherParticipant?.id),
    );

    setOrderFormsState(filteredForms);

    toast({
      title: 'Order Accepted!',
      description:
        'You have accepted the order. You can now proceed to payment.',
      variant: 'default',
    });
  };

  const handleRejectOrderForm = (orderFormId: string) => {
    console.log('Rejecting order form:', orderFormId);

    const allOrderForms = getOrderForms() || [];
    const updatedOrderForms = allOrderForms.map(form =>
      form.id === orderFormId ? { ...form, status: 'rejected' as const } : form,
    );

    setOrderForms(updatedOrderForms);

    // Update local state
    const filteredForms = updatedOrderForms.filter(
      form =>
        (form.sellerId === user?.id && form.buyerId === otherParticipant?.id) ||
        (form.buyerId === user?.id && form.sellerId === otherParticipant?.id),
    );

    setOrderFormsState(filteredForms);

    toast({
      title: 'Order Rejected',
      description: 'You have rejected the order.',
      variant: 'default',
    });
  };

  // Early returns after all hooks
  if (authLoading || loading) {
    return (
      <div className='flex min-h-screen flex-col'>
        <Navbar />
        <main className='flex-1 container mx-auto px-4 py-8 md:px-6 flex items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-agronetGreen' />
        </main>
        <Footer />
      </div>
    );
  }

  console.log('chat', chat);
  console.log('user', user);
  console.log('otherParticipant', otherParticipant);

  if (!chat || !user || !otherParticipant) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Navbar />
        <main className='flex-1 container mx-auto px-4 py-8 md:px-6 flex items-center justify-center'>
          <div className='text-center'>
            <p className='text-gray-500 mb-4'>
              Chat not found or access denied
            </p>
            <Button
              onClick={() => router.push('/chats')}
              className='bg-agronetGreen hover:bg-agronetGreen/90'>
              Back to Chats
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar />
      <main className='flex-1 flex flex-col container mx-auto px-4 py-8 md:px-6'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6 pb-4 border-b border-gray-200'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.push('/chats')}>
            <ArrowLeft className='h-6 w-6' />
            <span className='sr-only'>Back to chats</span>
          </Button>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src='/placeholder.svg?height=40&width=40'
              alt={otherParticipant?.firstname || 'User'}
            />
            <AvatarFallback>
              {(
                otherParticipant?.firstname ||
                otherParticipant?.fullName ||
                'U'
              )
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className='text-2xl font-bold text-agronetGreen'>
            {otherParticipant?.firstname ||
              otherParticipant?.fullName ||
              'User'}
          </h1>
          {user.role === 'seller' && (
            <Button
              onClick={handleSendOrderForm}
              className='ml-auto bg-agronetOrange hover:bg-agronetOrange/90 text-white'
              size='sm'>
              <Package className='h-4 w-4 mr-2' />
              Send Order Form
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg shadow-inner mb-4 min-h-[400px]'>
          {messages.length === 0 ? (
            <p className='text-center text-gray-500'>
              No messages yet. Start the conversation!
            </p>
          ) : (
            <>
              {/* Regular Messages */}
              {messages.map(message => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.senderId === user._id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}>
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                      message.senderId === user._id
                        ? 'bg-agronetGreen text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                    }`}>
                    <p className='text-sm'>{message.content}</p>
                    <span
                      className={`block text-xs mt-1 ${
                        message.senderId === user._id
                          ? 'text-agronetGreen-100'
                          : 'text-gray-500'
                      } text-right`}>
                      {formatTimestamp(message.createdAt)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Order Forms */}
              {orderForms.map(orderForm => (
                <div
                  key={orderForm.id}
                  className={`flex ${
                    orderForm.sellerId === user._id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}>
                  <div className='max-w-sm bg-white rounded-lg shadow-md p-4 border'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Package className='h-4 w-4 text-agronetGreen' />
                      <span className='font-semibold text-agronetGreen'>
                        Order Form
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          orderForm.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : orderForm.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {orderForm.status}
                      </span>
                    </div>
                    <h4 className='font-medium'>{orderForm.productName}</h4>
                    <p className='text-sm text-gray-600'>
                      Quantity: {orderForm.quantity}
                    </p>
                    <p className='text-sm font-bold text-agronetGreen'>
                      Total: ${orderForm.totalPrice.toFixed(2)}
                    </p>

                    {/* Action buttons for buyers */}
                    {orderForm.buyerId === user.id &&
                      orderForm.status === 'pending' && (
                        <div className='flex gap-2 mt-3'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='flex-1'
                            onClick={() => handleRejectOrderForm(orderForm.id)}>
                            Reject
                          </Button>
                          <Button
                            size='sm'
                            className='flex-1 bg-agronetGreen hover:bg-agronetGreen/90'
                            onClick={() => handleAcceptOrderForm(orderForm.id)}>
                            Accept
                          </Button>
                        </div>
                      )}

                    {/* Payment button for accepted orders */}
                    {orderForm.buyerId === user.id &&
                      orderForm.status === 'accepted' && (
                        <Button
                          size='sm'
                          className='w-full mt-3 bg-agronetOrange hover:bg-agronetOrange/90'
                          onClick={() =>
                            router.push(`/checkout/${orderForm.id}`)
                          }>
                          Proceed to Payment
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className='flex gap-2'>
          <Input
            placeholder='Type your message...'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className='flex-1'
            disabled={loading}
          />
          <Button
            type='submit'
            className='bg-agronetOrange hover:bg-agronetOrange/90 text-white'>
            <Send className='h-5 w-5' />
            <span className='sr-only'>Send message</span>
          </Button>
        </form>
      </main>
      <Footer />

      {/* Enhanced Order Form Modal */}
      {showOrderForm && selectedProduct && otherParticipant && (
        <EnhancedOrderFormModal
          product={selectedProduct}
          sellerId={user._id}
          buyerId={otherParticipant._id}
          onSubmit={handleOrderFormSubmit}
          onCancel={handleOrderFormCancel}
        />
      )}
    </div>
  );
}
