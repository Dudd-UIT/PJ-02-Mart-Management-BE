import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { UsersService } from '../users/users.service';
import { OrderDetailsService } from '../order_details/order_details.service';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderAndOrderDetailsDto } from './dto/create-order_order-detail.dto';
import { UpdateOrderDto } from './dto/update-order.dto';


describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let usersService: UsersService;
  let orderDetailsService: OrderDetailsService;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockUsersService = {
    findOneById: jest.fn(),
  };

  const mockConsole = {
    log: jest.fn(),
     error: jest.fn()
 }

  const mockOrderDetailsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        { provide: UsersService, useValue: mockUsersService },
        { provide: OrderDetailsService, useValue: mockOrderDetailsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    usersService = module.get<UsersService>(UsersService);
    orderDetailsService = module.get<OrderDetailsService>(OrderDetailsService);

    mockOrderRepository.create.mockImplementation((dto) => ({
      ...dto,
      id: expect.any(Number), // Giả lập order có ID
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

//   describe('createOrderAndOrderDetails', () => {
//     const mockCreateOrderDto: CreateOrderDto = {
//       totalPrice: 10000,
//       paymentMethod: 'Credit Card',
//       paymentTime: new Date('2024-04-11'),
//       status: 'Pending',
//       customerId: 1,
//       staffId: 2,
//     };

//     const mockOrderDetailsDto = [
//       { productUnitId: 1, quantity: 1, currentPrice: 1000 },
//     ];

//     const mockDto: CreateOrderAndOrderDetailsDto = {
//       orderDto: mockCreateOrderDto,
//       orderDetailsDto: mockOrderDetailsDto,
//     };

//     it('UTCID01: should create order and order details successfully', async () => {
//       const mockOrder = { id: 1, ...mockCreateOrderDto };
//       mockOrderRepository.create.mockReturnValue(mockOrder);
//       mockUsersService.findOneById.mockResolvedValueOnce({ id: 1, name: 'Customer 1' });
//       mockUsersService.findOneById.mockResolvedValueOnce({ id: 2, name: 'Staff 1' });
//       mockOrderRepository.save.mockResolvedValue(mockOrder);
//       mockOrderDetailsService.create.mockResolvedValue({});

//       const result = await service.createOrderAndOrderDetails(mockDto);

//       expect(result).toEqual(mockOrder);
//       expect(mockUsersService.findOneById).toHaveBeenCalledWith(1); // customerId
//       expect(mockUsersService.findOneById).toHaveBeenCalledWith(2); // staffId
//       expect(mockOrderRepository.save).toHaveBeenCalledWith(mockOrder);
//       expect(mockOrderDetailsService.create).toHaveBeenCalledWith({
//         ...mockOrderDetailsDto[0],
//         orderId: 1,
//       });
//     });

//     it('UTCID02: should throw NotFoundException when customerId does not exist', async () => {
//       mockUsersService.findOneById.mockResolvedValueOnce(null);

//       await expect(service.createOrderAndOrderDetails(mockDto)).rejects.toThrow(
//         NotFoundException,
//       );
//       expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
//     });

//     it('UTCID03: should throw NotFoundException when staffId does not exist', async () => {
//       mockUsersService.findOneById.mockResolvedValueOnce({ id: 1, name: 'Customer 1' });
//       mockUsersService.findOneById.mockResolvedValueOnce(null);

//       await expect(service.createOrderAndOrderDetails(mockDto)).rejects.toThrow(
//         NotFoundException,
//       );
//       expect(mockUsersService.findOneById).toHaveBeenCalledWith(2);
//     });

//     it('UTCID04: should throw InternalServerErrorException on unexpected error during order creation', async () => {
//       const mockCreateOrderDto: CreateOrderDto = {
//         totalPrice: 10000,
//         paymentMethod: 'Credit Card',
//         paymentTime: new Date('2024-04-11'),
//         status: 'Pending',
//         customerId: 1,
//         staffId: 2,
//       };
    
//       const mockOrderDetailsDto = [
//         { productUnitId: 1, quantity: 1, currentPrice: 1000 },
//       ];
    
//       const mockDto: CreateOrderAndOrderDetailsDto = {
//         orderDto: mockCreateOrderDto,
//         orderDetailsDto: mockOrderDetailsDto,
//       };
    
//       // Mocking the repository to throw an unexpected error
//       mockOrderRepository.create.mockImplementation(() => {
//         throw new Error('Unexpected error');
//       });
    
//       await expect(service.createOrderAndOrderDetails(mockDto)).rejects.toThrow(
//         InternalServerErrorException,
//       );
    
//       expect(mockOrderRepository.create).toHaveBeenCalledWith(mockCreateOrderDto);
//     });

//     it('UTCID05: should throw InternalServerErrorException on order details creation failure', async () => {
//       const mockOrder = { id: 1, ...mockCreateOrderDto };
//       mockOrderRepository.create.mockReturnValue(mockOrder);
//       mockUsersService.findOneById.mockResolvedValueOnce({ id: 1, name: 'Customer 1' });
//       mockUsersService.findOneById.mockResolvedValueOnce({ id: 2, name: 'Staff 1' });
//       mockOrderRepository.save.mockResolvedValue(mockOrder);
//       mockOrderDetailsService.create.mockRejectedValue(
//         new Error('Order detail creation failed'),
//       );

//       await expect(service.createOrderAndOrderDetails(mockDto)).rejects.toThrow(
//         InternalServerErrorException,
//       );
//       expect(mockOrderDetailsService.create).toHaveBeenCalled();
//     });

//     it('UTCID06: should throw InternalServerErrorException when there is an unexpected error in repository save', async () => {
//       const mockOrder = { id: 1, ...mockCreateOrderDto };
//       mockOrderRepository.create.mockReturnValue(mockOrder);
//       mockUsersService.findOneById.mockResolvedValueOnce({ id: 1, name: 'Customer 1' });
//       mockUsersService.findOneById.mockResolvedValueOnce({ id: 2, name: 'Staff 1' });
//       mockOrderRepository.save.mockRejectedValue(new Error('Database error'));

//       await expect(service.createOrderAndOrderDetails(mockDto)).rejects.toThrow(
//         InternalServerErrorException,
//       );
//       expect(mockOrderRepository.save).toHaveBeenCalledWith(mockOrder);
//     });
//   });


// describe('create', () => {
//     const mockOrderDto: CreateOrderDto = {
//       totalPrice: 10000,
//       paymentMethod: 'Credit Card',
//       paymentTime: new Date('2024-04-11'),
//       status: 'Pending',
//       customerId: 1,
//       staffId: 2,
//     };
  
//     const mockCustomer = { id: 1, name: 'Customer 1' };
//     const mockStaff = { id: 2, name: 'Staff 2' };
  
//     beforeEach(() => {
//       mockOrderRepository.create.mockImplementation((dto) => ({
//         ...dto,
//         id: expect.any(Number),
//       }));
//     });
  
//     it('UTCID01: should create order successfully', async () => {
//       mockUsersService.findOneById
//         .mockResolvedValueOnce(mockCustomer)
//         .mockResolvedValueOnce(mockStaff);
//       mockOrderRepository.save.mockResolvedValue({ id: 1, ...mockOrderDto });
  
//       const result = await service.create(mockOrderDto);
  
//       expect(mockUsersService.findOneById).toHaveBeenCalledTimes(2);
//       expect(mockOrderRepository.create).toHaveBeenCalledWith(mockOrderDto);
//       expect(mockOrderRepository.save).toHaveBeenCalled();
//       expect(result).toEqual({ id: 1, ...mockOrderDto });
//     });
  
//     it('UTCID02: should throw NotFoundException when customerId does not exist', async () => {
//       mockUsersService.findOneById.mockResolvedValueOnce(null);
  
//       await expect(service.create(mockOrderDto)).rejects.toThrow(
//         NotFoundException,
//       );
  
//       expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
//       expect(mockOrderRepository.save).not.toHaveBeenCalled();
//     });
  
//     it('UTCID03: should throw NotFoundException when staffId does not exist', async () => {
//       mockUsersService.findOneById
//         .mockResolvedValueOnce(mockCustomer)
//         .mockResolvedValueOnce(null);
  
//       await expect(service.create(mockOrderDto)).rejects.toThrow(
//         NotFoundException,
//       );
  
//       expect(mockUsersService.findOneById).toHaveBeenCalledWith(2);
//       expect(mockOrderRepository.save).not.toHaveBeenCalled();
//     });
  
//     it('UTCID04: should throw Error on save error', async () => {
//       mockUsersService.findOneById
//         .mockResolvedValueOnce(mockCustomer)
//         .mockResolvedValueOnce(mockStaff);
//       mockOrderRepository.save.mockRejectedValue(new Error('Save failed'));
  
//       await expect(service.create(mockOrderDto)).rejects.toThrow(Error);
  
//       expect(mockOrderRepository.save).toHaveBeenCalledWith(
//         expect.objectContaining(mockOrderDto),
//       );
//     });
  
//     it('UTCID05: should throw Error when usersService fails', async () => {
//       mockUsersService.findOneById.mockRejectedValue(new Error('Service error'));
  
//       await expect(service.create(mockOrderDto)).rejects.toThrow(Error);
  
//       expect(mockUsersService.findOneById).toHaveBeenCalledWith(1);
//     });
  
//     it('UTCID06: should throw Error when database connection fails', async () => {
//       mockUsersService.findOneById
//         .mockResolvedValueOnce(mockCustomer)
//         .mockResolvedValueOnce(mockStaff);
//       mockOrderRepository.save.mockRejectedValue(new Error('Connection failed'));
  
//       await expect(service.create(mockOrderDto)).rejects.toThrow(Error);
  
//       expect(mockOrderRepository.save).toHaveBeenCalled();
//     });
//   });
  
  

describe('findAll', () => {
  const mockQuery = {};
  const mockResults = [
    { id: 1, totalPrice: 10000, customer: { id: 1, name: 'Customer 1' }, staff: { id: 2, name: 'Staff 1' }, status: 'Pending' },
    { id: 2, totalPrice: 20000, customer: { id: 1, name: 'Customer 1' }, staff: { id: 2, name: 'Staff 1' }, status: 'Completed' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('UTCID01: should return paginated orders with meta (empty query)', async () => {
    mockOrderRepository.count.mockResolvedValue(5);
    mockOrderRepository.find.mockResolvedValue(mockResults);

    const result = await service.findAll(mockQuery, 1, 10);

    expect(result).toEqual({
      meta: {
        current: 1,
        pageSize: 10,
        pages: 1,
        total: 5,
      },
      results: mockResults,
    });

    expect(mockOrderRepository.count).toHaveBeenCalledWith({
      where: {},
    });
    expect(mockOrderRepository.find).toHaveBeenCalledWith({
      where: {},
      relations: expect.any(Array),
      take: 10,
      skip: 0,
    });
  });

  it('UTCID02: should return paginated product samples filtered by totalPrice', async () => {
    const mockOrders = [{ id: 1 , totalPrice: 10000 }, { id: 2 , totalPrice: 10000 }];
    mockOrderRepository.count.mockResolvedValue(mockOrders.length);
    mockOrderRepository.find.mockResolvedValue(mockOrders);
  
    const result = await service.findAll({ totalPrice: 10000 }, 1, 10);
  
    expect(result).toEqual({
      meta: {
        current: 1,
        pageSize: 10,
        pages: 1,
        total: 2,
      },
      results: mockOrders,
    });
  
    // Kiểm tra count và find với filter
    expect(mockOrderRepository.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { totalPrice: 10000 },
      })
    );
    expect(mockOrderRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { totalPrice: 10000 },
        relations: expect.any(Array),
        take: 10,
        skip: 0,
      })
    );
    expect(mockConsole.log).toHaveBeenCalledWith('Trả về danh sách đơn hàng thành công');
  });
  
  

  it('UTCID03: should return paginated orders filtered by customerId', async () => {
    const mockOrders = [
      { id: 1, customer: { id: 1 } },
      { id: 2, customer: { id: 1 } },
    ];
    mockOrderRepository.count.mockResolvedValue(mockOrders.length);
    mockOrderRepository.find.mockResolvedValue(mockOrders);
  
    const result = await service.findAll({ customer: { id: 1 } }, 1, 10);
  
    expect(result).toEqual({
      meta: {
        current: 1,
        pageSize: 10,
        pages: 1,
        total: 2,
      },
      results: mockOrders,
    });
  
    // Kiểm tra filter cho customer.id
    expect(mockOrderRepository.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customer: { id: 1 } },
      })
    );
    expect(mockOrderRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { customer: { id: 1 } },
        relations: expect.any(Array),
        take: 10,
        skip: 0,
      })
    );
    expect(mockConsole.log).toHaveBeenCalledWith('Trả về danh sách đơn hàng thành công');
  });
  
  

  it('UTCID04: should return empty results when there are no orders', async () => {
    mockOrderRepository.count.mockResolvedValue(0);
    mockOrderRepository.find.mockResolvedValue([]);

    const result = await service.findAll(mockQuery, 1, 10);

    expect(result).toEqual({
      meta: {
        current: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
      },
      results: [],
    });

    expect(mockOrderRepository.count).toHaveBeenCalledWith({
      where: {},
    });
    expect(mockOrderRepository.find).toHaveBeenCalledWith({
      where: {},
      relations: expect.any(Array),
      take: 10,
      skip: 0,
    });
  });

  it('UTCID05: should apply default pagination when current and pageSize are undefined', async () => {
    mockOrderRepository.count.mockResolvedValue(5);
    mockOrderRepository.find.mockResolvedValue(mockResults);

    const result = await service.findAll(mockQuery, undefined, undefined);

    expect(result).toEqual({
      meta: {
        current: 1,
        pageSize: 10,
        pages: 1,
        total: 5,
      },
      results: mockResults,
    });

    expect(mockOrderRepository.find).toHaveBeenCalledWith({
      where: {},
      relations: expect.any(Array),
      take: 10,
      skip: 0,
    });
  });

  it('UTCID06: should throw InternalServerErrorException on database error', async () => {
    mockOrderRepository.count.mockRejectedValue(new InternalServerErrorException('Database error'));

    await expect(service.findAll(mockQuery, 1, 10)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockOrderRepository.count).toHaveBeenCalled();
  });
});

// describe('findOne', () => {
//   const mockOrder = { id: 1, totalPrice: 10000, customerId: 1, staffId: 2, status: 'Pending' };

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('UTCID01: should return order when order exists', async () => {
//     // Mock the order repository's findOne method to return the mockOrder
//     mockOrderRepository.findOne.mockResolvedValue(mockOrder);

//     const result = await service.findOne(1);

//     expect(result).toEqual(mockOrder);
//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//   });

//   it('UTCID02: should throw NotFoundException when order does not exist', async () => {
//     // Mock the order repository's findOne method to return null
//     mockOrderRepository.findOne.mockResolvedValue(null);

//     // Expect the service to throw a NotFoundException with the message
//     await expect(service.findOne(99)).rejects.toThrowError(
//       new NotFoundException('Không tìm thấy đơn hàng')
//     );
//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 99 } });
//   });

//   it('UTCID03: should throw InternalServerErrorException on database connection error', async () => {
//     // Simulate a database connection error by making the findOne method throw an error
//     mockOrderRepository.findOne.mockRejectedValue(new Error('Lỗi khi tìm kiếm đơn hàng'));

//     // Expect the service to throw an InternalServerErrorException
//     await expect(service.findOne(1)).rejects.toThrowError(
//       new InternalServerErrorException('Lỗi khi tìm kiếm đơn hàng')
//     );
//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//   });
// });


// describe('remove', () => {
//   const mockOrder = { id: 1, totalPrice: 10000, customerId: 1, staffId: 2, status: 'Pending' };

//   it('UTCID01: should return deleted order when order exists', async () => {
//     mockOrderRepository.findOne.mockResolvedValue(mockOrder);
//     mockOrderRepository.softDelete.mockResolvedValue({ affected: 1 });
  
//     const result = await service.remove(1);
  
//     expect(result).toEqual({ affected: 1 });
//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     expect(mockOrderRepository.softDelete).toHaveBeenCalledWith(1);
//   });
  

//   it('UTCID02: should throw NotFoundException when order does not exist', async () => {
//     // Mock the order repository's findOne method to return null for a non-existing order
//     mockOrderRepository.findOne.mockResolvedValue(null);

//     // Expect the service to throw a NotFoundException with the message
//     await expect(service.remove(99)).rejects.toThrowError(
//       new NotFoundException('Không tìm thấy đơn hàng')
//     );
//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 99 } });
//   });

//   it('UTCID03: should throw InternalServerErrorException on database connection error', async () => {
//     // Simulate a database connection error by making the findOne method throw an error
//     mockOrderRepository.findOne.mockRejectedValue(new Error('Lỗi khi tìm kiếm đơn hàng'));

//     // Expect the service to throw an InternalServerErrorException
//     await expect(service.remove(1)).rejects.toThrowError(
//       new InternalServerErrorException('Lỗi khi tìm kiếm đơn hàng')
//     );
//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//   });
// });



// describe('update', () => {
//   const mockOrder = { id: 1, totalPrice: 10000, customerId: 1, staffId: 2, status: 'Pending' };
//   const updateDto: UpdateOrderDto = {
//     totalPrice: 20000,
//     paymentMethod: 'Credit Card',
//     paymentTime: new Date('2024-04-11'),
//     status: 'Completed',
//     customerId: 1,
//     staffId: 2,
//   };

//   it('UTCID01: should update order successfully', async () => {
//     const updatedOrder = {
//       ...mockOrder,
//       ...updateDto,
//       customer: { id: 1, name: 'Customer 1' },
//       staff: { id: 2, name: 'Staff 2' },
//     };

//     mockOrderRepository.findOne.mockResolvedValue(mockOrder);
//     mockUsersService.findOneById
//       .mockResolvedValueOnce({ id: 1, name: 'Customer 1' }) // Mock customer
//       .mockResolvedValueOnce({ id: 2, name: 'Staff 2' }); // Mock staff
//     mockOrderRepository.save.mockResolvedValue(updatedOrder);

//     const result = await service.update(1, updateDto);

//     expect(result).toEqual(updatedOrder);
//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     expect(mockOrderRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
//   });

//   it('UTCID02: should throw NotFoundException when order does not exist', async () => {
//     mockOrderRepository.findOne.mockResolvedValue(null);

//     await expect(service.update(99, updateDto)).rejects.toThrow(
//       new NotFoundException('Không tìm thấy đơn hàng'),
//     );

//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 99 } });
//     expect(mockOrderRepository.save).not.toHaveBeenCalled();
//   });

//   it('UTCID03: should throw NotFoundException when customer does not exist', async () => {
//     mockOrderRepository.findOne.mockResolvedValue(mockOrder);
//     mockUsersService.findOneById.mockResolvedValueOnce(null); // Customer not found

//     await expect(service.update(1, { ...updateDto, customerId: 99 })).rejects.toThrow(
//       new NotFoundException('Không tìm thấy mã khách hàng'),
//     );

//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     expect(mockUsersService.findOneById).toHaveBeenCalledWith(99);
//     expect(mockOrderRepository.save).not.toHaveBeenCalled();
//   });

//   it('UTCID04: should throw NotFoundException when staff does not exist', async () => {
//     mockOrderRepository.findOne.mockResolvedValue(mockOrder);
//     mockUsersService.findOneById
//       .mockResolvedValueOnce({ id: 1 }) // Customer exists
//       .mockResolvedValueOnce(null); // Staff not found

//     await expect(service.update(1, { ...updateDto, staffId: 99 })).rejects.toThrow(
//       new NotFoundException('Không tìm thấy mã nhân viên'),
//     );

//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     expect(mockUsersService.findOneById).toHaveBeenCalledWith(99);
//     expect(mockOrderRepository.save).not.toHaveBeenCalled();
//   });

//   it('UTCID05: should throw InternalServerErrorException on repository error', async () => {
//     mockOrderRepository.findOne.mockRejectedValue(new Error('Lỗi khi cập nhật đơn hàng'));

//     await expect(service.update(1, updateDto)).rejects.toThrow(
//       new InternalServerErrorException('Lỗi khi cập nhật đơn hàng'),
//     );

//     expect(mockOrderRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
//     expect(mockOrderRepository.save).not.toHaveBeenCalled();
//   });
// });



});
