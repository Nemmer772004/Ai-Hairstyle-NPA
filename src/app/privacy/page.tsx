export default function PrivacyPage() {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 font-headline">Chính sách bảo mật</h1>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Chào mừng bạn đến với Studio Tóc AI. Chúng tôi coi trọng quyền riêng tư của bạn và tài liệu này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân.
          </p>
          <h2 className="text-2xl font-semibold text-foreground pt-4">Dữ liệu hình ảnh</h2>
          <p>
            Khi sử dụng dịch vụ, bạn có thể tải lên ảnh chân dung. Chúng tôi chỉ dùng những hình ảnh này để tạo bản xem trước kiểu tóc bằng mô hình AI.
          </p>
          <p>
            <strong>Tất cả ảnh tải lên và kết quả tạo ra sẽ được xoá tự động, vĩnh viễn khỏi máy chủ sau 24 giờ.</strong> Chúng tôi không lưu trữ hình ảnh dài hạn và không sử dụng cho bất kỳ mục đích nào khác ngoài tính năng thử kiểu tóc. Dữ liệu hình ảnh không được bán, trao đổi hay chuyển giao cho bên thứ ba.
          </p>
          <h2 className="text-2xl font-semibold text-foreground pt-4">Thông tin tài khoản</h2>
          <p>
            Khi tạo tài khoản, chúng tôi lưu trữ tên người dùng, email và mật khẩu đã mã hoá. Những dữ liệu này giúp bạn xem lại lịch sử, đồng thời cá nhân hoá trải nghiệm. Thông tin cá nhân sẽ không được chia sẻ cho bên thứ ba nếu không có sự đồng ý của bạn, trừ trường hợp pháp luật yêu cầu.
          </p>
          <h2 className="text-2xl font-semibold text-foreground pt-4">Nhật ký hệ thống</h2>
          <p>
            Giống nhiều website khác, Studio Tóc AI sử dụng log hệ thống để phân tích xu hướng và cải thiện dịch vụ. Các log có thể bao gồm địa chỉ IP, loại trình duyệt, nhà cung cấp dịch vụ Internet, thời gian truy cập, trang giới thiệu/thoát và số lượt tương tác. Thông tin này không liên kết trực tiếp tới dữ liệu nhận dạng cá nhân.
          </p>
          <h2 className="text-2xl font-semibold text-foreground pt-4">Sự đồng ý</h2>
          <p>
            Khi tiếp tục sử dụng trang web, bạn đồng ý với chính sách bảo mật và các điều khoản nêu trên.
          </p>
          <h2 className="text-2xl font-semibold text-foreground pt-4">Thay đổi chính sách</h2>
          <p>
            Chính sách này có hiệu lực kể từ ngày ban hành và có thể được điều chỉnh để phù hợp với nhu cầu vận hành. Mọi cập nhật sẽ được công bố ngay trên trang này, vì vậy hãy kiểm tra định kỳ để nắm thông tin mới nhất.
          </p>
        </div>
      </div>
    );
  }
  
