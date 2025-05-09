import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { environment } from 'src/app/environments/environment';
import { OrderDTO } from '../../dtos/order/order.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup; // Đối tượng FormGroup để quản lý dữ liệu của form
  cartItems: { product: Product, quantity: number }[] = [];
  couponCode: string = ''; // Mã giảm giá
  totalAmount: number = 0; // Tổng tiền
  orderData: OrderDTO = {
    user_id: 5, // Thay bằng user_id thích hợp
    fullname: '', // Khởi tạo rỗng, sẽ được điền từ form
    email: '', // Khởi tạo rỗng, sẽ được điền từ form
    phone_number: '', // Khởi tạo rỗng, sẽ được điền từ form
    address: '', // Khởi tạo rỗng, sẽ được điền từ form
    note: '', // Có thể thêm trường ghi chú nếu cần
    total_money: 0, // Sẽ được tính toán dựa trên giỏ hàng và mã giảm giá
    payment_method: 'cod', // Mặc định là thanh toán khi nhận hàng (COD)
    shipping_method: 'express', // Mặc định là vận chuyển nhanh (Express)
    coupon_code: '', // Sẽ được điền từ form khi áp dụng mã giảm giá
    cart_items: []
  };

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private fb: FormBuilder
  ) {
 //Tạo form group và các form controller tương ứng
    this.orderForm = this.fb.group({
      fullname: ['',[Validators.required]],
      email: ['',[Validators.email]],
      phone_number: ['', [Validators.required,Validators.minLength(6)]],
      address: ['',[Validators.required,Validators.minLength(5)]],
      note: [''],
      shipping_method: ['express'],
      payment_method: ['cod']
    });
  }





  ngOnInit(): void {
    // Lấy danh sách sản phẩm từ giỏ hàng
    debugger
    const cart = this.cartService.getCart();
    const productIds = Array.from(cart.keys()); // Chuyển danh sách ID từ Map giỏ hàng

    // Gọi service để lấy thông tin sản phẩm dựa trên danh sách ID
    debugger
    this.productService.getProductsByIds(productIds).subscribe({
      next: (products) => {
        debugger
        // Lấy thông tin sản phẩm và số lượng từ danh sách sản phẩm và giỏ hàng
        this.cartItems = productIds.map((productId) => {
          debugger
          const product = products.find((p) => p.id === productId);
          if (product) {
            product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          }
          return {
            product: product!,
            quantity: cart.get(productId)!
          };
        });
        console.log('haha');
      },
      complete: () => {
        debugger;
        this.calculateTotal()
      },
      error: (error: any) => {
        debugger;
        console.error('Error fetching detail:', error);
      }
    });
  }
  placeOrder() {
    debugger
    if(this.orderForm.valid){
      //Gán giá trị từ form vào đối tượng orderData
      // this.orderData.fullname = this.orderForm.get('fullname')!.value;
      // this.orderData.email = this.orderForm.get('email')!.value;
      // this.orderData.phone_number = this.orderForm.get('phone_number')!.value;
      // this.orderData.address = this.orderForm.get('adrress')!.value;
      // this.orderData.note = this.orderForm.get('note')!.value;
      // this.orderData.shipping_method = this.orderForm.get('shipping_method')!.value;
      // this.orderData.payment_method = this.orderForm.get('payment_method')!.value;
      //Sử dụng toán tử spread (...) để sao chép giá trị từ form vào orderData

      this.orderData = {
        ...this.orderData,
        ...this.orderForm.value
      };
      this.orderData.cart_items = this.cartItems.map(cartItem => ({
        product_id: cartItem.product.id,
        quantity: cartItem.quantity
      }))

    }
    this.orderService.placeOrder(this.orderData).subscribe({
      next: (response) => {
        debugger
        console.log('Đặt hàng thành công');
      },
      complete: () => {
        debugger;
        this.calculateTotal()
      },
      error: (error: any) => {
        debugger;
        console.error('Lỗi khi đặt hàng:', error);
      }
    });
  }

  // Hàm tính tổng tiền
  calculateTotal(): void {
      this.totalAmount = this.cartItems.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
      );
  }

  // Hàm xử lý việc áp dụng mã giảm giá
  applyCoupon(): void {
      // Viết mã xử lý áp dụng mã giảm giá ở đây
      // Cập nhật giá trị totalAmount dựa trên mã giảm giá nếu áp dụng
  }
}
