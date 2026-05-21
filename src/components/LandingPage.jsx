// src/components/LandingPage.jsx
import React, { useState, useEffect } from "react";
import "../LandingPage.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://script.google.com/macros/s/AKfycbzMuam393Ao4cePF-TJdnUfFKUnFZ7F8e-uz5EK1BZ65oUtlHRgrra1rtbN32ukX6yv/exec";

const CAT_EMOJI = {
  "Căn Hộ": "🏙️",
  "Văn Phòng": "🏢",
  "Biệt Thự": "🏠",
  "Khách Sạn": "🏨",
  "Thương Mại": "🏪",
  "Nhà Phố": "🏘️",
  Khác: "🏗️",
};

const FALLBACK_BG = [
  "linear-gradient(135deg,#1a2035,#0d1520)",
  "linear-gradient(135deg,#201a10,#150f05)",
  "linear-gradient(135deg,#0d2020,#051510)",
  "linear-gradient(135deg,#201018,#150810)",
  "linear-gradient(135deg,#1a1520,#0d0a15)",
  "linear-gradient(135deg,#1c1a10,#100e05)",
  "linear-gradient(135deg,#0d1a20,#050f15)",
];

export default function LandingPage({ onNavigateToAdmin }) {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentCat, setCurrentCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({});

  // Album Lightbox State
  const [activeProject, setActiveProject] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    area: "",
    address: "",
    note: "",
  });

  // Calculator states
  const [calcParams, setCalcParams] = useState({
    svc: 95000,
    area: 50,
    mat: 1.0,
    build: 1.0,
  });
  const [calcActive, setCalcActive] = useState(false);

  // Hiệu ứng chuột Custom Cursor
  useEffect(() => {
    const cur = document.getElementById("cursor");
    const ring = document.getElementById("cursor-ring");
    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;

    const handleMouseMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (cur) {
        cur.style.left = mx + "px";
        cur.style.top = my + "px";
      }
    };
    document.addEventListener("mousemove", handleMouseMove);

    let frameId;
    const anim = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) {
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
      }
      frameId = requestAnimationFrame(anim);
    };
    anim();

    const handleMouseEnter = () => {
      if (cur && ring) {
        cur.style.width = "16px";
        cur.style.height = "16px";
        ring.style.width = "50px";
        ring.style.height = "50px";
      }
    };
    const handleMouseLeave = () => {
      if (cur && ring) {
        cur.style.width = "10px";
        cur.style.height = "10px";
        ring.style.width = "36px";
        ring.style.height = "36px";
      }
    };

    const interactives = document.querySelectorAll(
      "a, button, select, input, textarea, .filter-btn, .g-item, .lightbox-arrow, .lightbox-thumb, .lightbox-close"
    );
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [loading, activeProject]);

  // Hiệu ứng Nav Scroll
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById("nav");
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hiệu ứng Scroll Reveal (.rv)
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("in"), i * 50);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document
      .querySelectorAll(".rv, .rv-l, .rv-r")
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  // Hiệu ứng chạy Counter Số
  useEffect(() => {
    const animC = (el) => {
      const t = +el.dataset.count;
      const suf = el.textContent.slice(-1);
      let n = 0,
        step = t / 60;
      const iv = setInterval(() => {
        n += step;
        if (n >= t) {
          n = t;
          clearInterval(iv);
        }
        el.textContent = Math.floor(n) + (isNaN(suf) ? suf : "");
      }, 20);
    };
    const cObs = new IntersectionObserver(
      (e) =>
        e.forEach((e) => {
          if (e.isIntersecting) {
            animC(e.target);
            cObs.unobserve(e.target);
          }
        }),
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-count]").forEach((el) => cObs.observe(el));
    return () => cObs.disconnect();
  }, [loading]);

  // Load Gallery và Content
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [galRes, cntRes] = await Promise.all([
          fetch(`${API_URL}?t=${Date.now()}`).then((r) => r.json()),
          fetch(`${API_URL}?type=content&t=${Date.now()}`).then((r) =>
            r.json()
          ),
        ]);
        setAllItems(galRes.items || []);
        setFilteredItems(galRes.items || []);
        setLoading(false);

        if (cntRes.content) {
          const mapped = {};
          cntRes.content.forEach(({ key, value }) => {
            mapped[key] = value;
          });
          setContent(mapped);
        }
      } catch (e) {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const filterG = (cat) => {
    setCurrentCat(cat);
    if (cat === "all") {
      setFilteredItems(allItems);
    } else {
      setFilteredItems(allItems.filter((i) => i.category === cat));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Vui lòng nhập họ tên!");
      return;
    }
    if (!formData.phone) {
      alert("Vui lòng nhập số điện thoại!");
      return;
    }

    const btn = document.querySelector(".cf-submit");
    btn.textContent = "⏳ Đang gửi...";
    btn.disabled = true;

    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...formData }),
      });
      btn.textContent = "✅ Đã gửi thành công!";
      btn.style.background = "#22c55e";
      document.getElementById("cf-success").classList.add("show");
      setTimeout(() => {
        btn.textContent = "📩 Gửi Yêu Cầu Báo Giá";
        btn.style.background = "";
        btn.disabled = false;
        document.getElementById("cf-success").classList.remove("show");
        setFormData({
          name: "",
          phone: "",
          email: "",
          service: "",
          area: "",
          address: "",
          note: "",
        });
      }, 4000);
    } catch (err) {
      btn.textContent = "❌ Gửi thất bại — thử lại!";
      btn.style.background = "#ef4444";
      btn.disabled = false;
    }
  };

  // Tính toán báo giá
  const calcTotal = Math.round(
    calcParams.svc * calcParams.area * calcParams.mat * calcParams.build
  );

  // Xử lý click mở popup album ảnh
  const handleOpenLightbox = (item) => {
    const parsedImages = item.image
      ? item.image.split(/[\s,\n\t]+/).filter((url) => url.trim() !== "")
      : [];
    setActiveProject({ ...item, imageList: parsedImages });
    setActiveImgIndex(0);
  };

  const handlePrevImg = (e) => {
    e.stopPropagation();
    if (!activeProject || activeProject.imageList.length <= 1) return;
    setActiveImgIndex((prev) =>
      prev === 0 ? activeProject.imageList.length - 1 : prev - 1
    );
  };

  const handleNextImg = (e) => {
    e.stopPropagation();
    if (!activeProject || activeProject.imageList.length <= 1) return;
    setActiveImgIndex((prev) =>
      prev === activeProject.imageList.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div>
      <div id="cursor"></div>
      <div id="cursor-ring"></div>

      {/* NAV */}
      <nav id="nav">
        <a href="#" className="logo-wrap">
          <div className="logo-icon">🏠</div>
          <span className="logo-text">
            Thạch<span>Pro</span>
          </span>
        </a>
        <ul className="nav-center">
          <li>
            <a href="#services">Dịch Vụ</a>
          </li>
          <li>
            <a href="#gallery">Công Trình</a>
          </li>
          <li>
            <a href="#calc">Báo Giá</a>
          </li>
          <li>
            <a href="#materials">Vật Liệu</a>
          </li>
          <li>
            <a href="#reviews">Đánh Giá</a>
          </li>
          <li>
            <a href="#contact">Liên Hệ</a>
          </li>
        </ul>
        <div className="nav-right">
          <a
            href={`tel:${content.contact_phone || "0901234567"}`}
            className="nav-phone"
          >
            📞 {content.contact_phone || "0901 234 567"}
          </a>
          <button
            onClick={onNavigateToAdmin}
            className="btn-nav"
            style={{ marginRight: "10px" }}
          >
            Admin
          </button>
          <a href="#cta" className="btn-nav">
            Liên Hệ Ngay
          </a>
          <button
            className="mobile-menu-btn"
            onClick={() =>
              document.getElementById("mobile-menu").classList.add("open")
            }
          >
            ☰
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div id="mobile-menu">
        <button
          className="mobile-close"
          onClick={() =>
            document.getElementById("mobile-menu").classList.remove("open")
          }
        >
          ✕
        </button>
        <a
          href="#services"
          onClick={() =>
            document.getElementById("mobile-menu").classList.remove("open")
          }
        >
          Dịch Vụ
        </a>
        <a
          href="#gallery"
          onClick={() =>
            document.getElementById("mobile-menu").classList.remove("open")
          }
        >
          Công Trình
        </a>
        <a
          href="#calc"
          onClick={() =>
            document.getElementById("mobile-menu").classList.remove("open")
          }
        >
          Báo Giá
        </a>
        <a
          href="#materials"
          onClick={() =>
            document.getElementById("mobile-menu").classList.remove("open")
          }
        >
          Vật Liệu
        </a>
        <a
          href="#contact"
          onClick={() =>
            document.getElementById("mobile-menu").classList.remove("open")
          }
        >
          Liên Hệ
        </a>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="hero-orb"></div>
        <div className="hero-orb2"></div>
        <div className="hero-bignum" data-key="hero_bignum">
          {content.hero_bignum || "15"}
        </div>
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-tag">
              <span className="dot"></span>{" "}
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    content.hero_tag || "Đang nhận dự án — TP.HCM & Bình Dương",
                }}
              ></span>
            </div>
            <h1
              className="hero-title"
              dangerouslySetInnerHTML={{
                __html:
                  content.hero_title ||
                  "Kiến Tạo<br>Không Gian<br><em>Hoàn Hảo</em>",
              }}
            ></h1>
            <p
              className="hero-sub"
              dangerouslySetInnerHTML={{
                __html:
                  content.hero_sub ||
                  "Đơn vị thi công thạch cao hàng đầu tại TP.HCM — trần giật cấp, vách ngăn, phào chỉ trang trí. Cung cấp vật liệu xây dựng cao cấp Knauf, USG chính hãng, giao tận công trình.",
              }}
            ></p>
            <div className="hero-btns">
              <a
                href="#calc"
                className="btn-primary"
                dangerouslySetInnerHTML={{
                  __html: content.hero_btn1 || "→ Nhận Báo Giá Miễn Phí",
                }}
              ></a>
              <a
                href="#gallery"
                className="btn-ghost"
                dangerouslySetInnerHTML={{
                  __html: content.hero_btn2 || "Xem Công Trình →",
                }}
              ></a>
            </div>
          </div>
          <div className="hero-right">
            <div className="stat-box">
              <div className="stat-num" data-count={content.stat1_num || "500"}>
                0+
              </div>
              <div className="stat-lbl">
                {content.stat1_lbl || "Công trình hoàn thành"}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-num" data-count={content.stat2_num || "15"}>
                0+
              </div>
              <div className="stat-lbl">
                {content.stat2_lbl || "Năm kinh nghiệm"}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-num" data-count={content.stat3_num || "98"}>
                0%
              </div>
              <div className="stat-lbl">
                {content.stat3_lbl || "Khách hàng hài lòng"}
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-ind">
          <span>Cuộn xuống</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-inner">
          <div className="ticker-track">
            {Array(2)
              .fill([
                "Trần Thạch Cao Phẳng",
                "Trần Giật Cấp",
                "Vách Ngăn Nhẹ",
                "Phào Chỉ Trang Trí",
                "Knauf · USG · Vĩnh Tường",
                "Khung Thép Mạ Kẽm",
                "Bả Bột & Sơn Nước",
                "Bảo Hành 24 Tháng",
              ])
              .flat()
              .map((item, idx) => (
                <div key={idx} className="ticker-item">
                  {item} <span className="ticker-sep">✦</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <section id="services">
        <div className="services-head">
          <div>
            <div className="sec-eyebrow rv">Dịch Vụ</div>
            <h2
              className="sec-title rv d1"
              dangerouslySetInnerHTML={{
                __html:
                  content.services_title ||
                  'Thi Công Toàn Diện<br><em style="font-style:italic;color:var(--accent)">Đúng Chất Lượng</em>',
              }}
            ></h2>
          </div>
          <p className="sec-desc rv d2">
            {content.services_desc ||
              "Đội thợ lành nghề 10+ năm kinh nghiệm. Cam kết tiến độ, chất lượng bề mặt mịn phẳng tiêu chuẩn, bảo hành dài hạn."}
          </p>
        </div>
        <div className="svc-grid rv">
          {/* Card 1 */}
          <div className="svc-card">
            <div className="svc-top">
              <div className="svc-ico">🏛️</div>
              <div className="svc-n">01</div>
            </div>
            <div className="svc-name">
              {content.svc1_title || "Trần Thạch Cao Phẳng"}
            </div>
            <div className="svc-desc">
              {content.svc1_desc ||
                "Thi công trần phẳng khung nổi & khung chìm. Bề mặt phẳng mịn tuyệt đối, che đường điện, điều hoà gọn gàng. Phù hợp căn hộ, văn phòng, nhà dân."}
            </div>
            <div className="svc-price">
              {content.svc1_price || "Từ 95.000đ/m²"}{" "}
              <span className="svc-arrow">→</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="svc-card">
            <div className="svc-top">
              <div className="svc-ico">✨</div>
              <div className="svc-n">02</div>
            </div>
            <div className="svc-name">
              {content.svc2_title || "Trần Giật Cấp Nghệ Thuật"}
            </div>
            <div className="svc-desc">
              {content.svc2_desc ||
                "Thiết kế và thi công trần giật cấp 2–4 tầng, tích hợp hệ đèn LED âm trần, cắt chỉ nổi. Tạo chiều sâu không gian và điểm nhấn sang trọng."}
            </div>
            <div className="svc-price">
              {content.svc2_price || "Từ 145.000đ/m²"}{" "}
              <span className="svc-arrow">→</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="svc-card">
            <div className="svc-top">
              <div className="svc-ico">🪟</div>
              <div className="svc-n">03</div>
            </div>
            <div className="svc-name">
              {content.svc3_title || "Vách Ngăn Thạch Cao"}
            </div>
            <div className="svc-desc">
              {content.svc3_desc ||
                "Vách ngăn khung thép mạ kẽm, tấm thạch cao tiêu chuẩn hoặc chống ẩm. Cách âm, cách nhiệt vượt trội. Linh hoạt bố cục không gian sống."}
            </div>
            <div className="svc-price">
              {content.svc3_price || "Từ 180.000đ/m²"}{" "}
              <span className="svc-arrow">→</span>
            </div>
          </div>
          {/* Card 4 */}
          <div className="svc-card">
            <div className="svc-top">
              <div className="svc-ico">🎨</div>
              <div className="svc-n">04</div>
            </div>
            <div className="svc-name">
              {content.svc4_title || "Phào Chỉ & Trang Trí"}
            </div>
            <div className="svc-desc">
              {content.svc4_desc ||
                "Thi công phào chỉ thạch cao ốp tường, trần. Hoa văn cổ điển đến hiện đại, phào góc bo, gờ nổi. Hoàn thiện chi tiết tinh xảo."}
            </div>
            <div className="svc-price">
              {content.svc4_price || "Từ 120.000đ/md"}{" "}
              <span className="svc-arrow">→</span>
            </div>
          </div>
          {/* Card 5 */}
          <div className="svc-card">
            <div className="svc-top">
              <div className="svc-ico">🖌️</div>
              <div className="svc-n">05</div>
            </div>
            <div className="svc-name">
              {content.svc5_title || "Bả Bột & Sơn Nước"}
            </div>
            <div className="svc-desc">
              {content.svc5_desc ||
                "Bả Matit 2–3 lớp, xử lý bề mặt trơn mịn hoàn hảo. Thi công sơn nước Dulux, Jotun, Kova nội ngoại thất. Màu sắc theo yêu cầu."}
            </div>
            <div className="svc-price">
              {content.svc5_price || "Từ 55.000đ/m²"}{" "}
              <span className="svc-arrow">→</span>
            </div>
          </div>
          {/* Card 6 */}
          <div className="svc-card">
            <div className="svc-top">
              <div className="svc-ico">🏗️</div>
              <div className="svc-n">06</div>
            </div>
            <div className="svc-name">
              {content.svc6_title || "Cung Cấp Vật Liệu"}
            </div>
            <div className="svc-desc">
              {content.svc6_desc ||
                "Phân phối tấm thạch cao Knauf, USG, Vĩnh Tường; khung thép mạ kẽm; bông khoáng; phụ kiện. Giao tận công trình toàn TP.HCM, Bình Dương."}
            </div>
            <div className="svc-price">
              {content.svc6_price || "Giá sỉ tốt nhất"}{" "}
              <span className="svc-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="about-visual rv-l">
          <div className="about-ring-outer">
            <div className="about-ring-inner">
              <div className="arc-num">{content.about_years || "15+"}</div>
              <div className="arc-lbl">
                Năm
                <br />
                Kinh Nghiệm
              </div>
            </div>
          </div>
          <div className="about-badges">
            <div className="badge">Knauf Partner</div>
            <div className="badge">ISO 9001</div>
            <div className="badge">USG Authorized</div>
            <div className="badge">Vĩnh Tường</div>
          </div>
        </div>
        <div className="about-text rv-r">
          <div className="sec-eyebrow">Về Chúng Tôi</div>
          <h2 className="sec-title">
            {content.about_title || "Hơn 15 Năm Xây Dựng Niềm Tin"}
          </h2>
          <p className="sec-desc">
            {content.about_desc ||
              "ThạchPro được thành lập năm 2008, đã hoàn thiện hơn 500 công trình từ căn hộ cao cấp, biệt thự, văn phòng đến trung tâm thương mại trên toàn TP.HCM."}
          </p>
          <div className="feat-list">
            <div className="feat">
              <div className="feat-ico">🏆</div>
              <div>
                <div className="feat-title">
                  {content.about_feat1_title || "Đội Ngũ Thợ Chuyên Nghiệp"}
                </div>
                <div className="feat-desc">
                  {content.about_feat1_desc ||
                    "30+ thợ lành nghề với 10+ năm kinh nghiệm. Được đào tạo bài bản theo tiêu chuẩn Knauf & USG."}
                </div>
              </div>
            </div>
            <div className="feat">
              <div className="feat-ico">📋</div>
              <div>
                <div className="feat-title">
                  {content.about_feat2_title || "Báo Giá Minh Bạch"}
                </div>
                <div className="feat-desc">
                  {content.about_feat2_desc ||
                    "Không phát sinh chi phí ngoài hợp đồng. Báo giá chi tiết từng hạng mục, vật tư rõ ràng ngay từ đầu."}
                </div>
              </div>
            </div>
            <div className="feat">
              <div className="feat-ico">⚡</div>
              <div>
                <div className="feat-title">
                  {content.about_feat3_title || "Tiến Độ Đúng Cam Kết"}
                </div>
                <div className="feat-desc">
                  {content.about_feat3_desc ||
                    "Đảm bảo hoàn thành đúng hạn. Làm sạch công trình hàng ngày, không gây ảnh hưởng đến sinh hoạt."}
                </div>
              </div>
            </div>
            <div className="feat">
              <div className="feat-ico">🛡️</div>
              <div>
                <div className="feat-title">
                  {content.about_feat4_title || "Bảo Hành 24 Tháng"}
                </div>
                <div className="feat-desc">
                  {content.about_feat4_desc ||
                    "Cam kết bảo hành toàn bộ hạng mục 24 tháng. Hỗ trợ bảo trì miễn phí sau thời gian bảo hành."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery">
        <div className="sec-eyebrow rv">Dự Án Tiêu Biểu</div>
        <h2 className="sec-title rv d1">Công Trình Đã Thực Hiện</h2>
        <div className="gallery-filters rv d2" id="gallery-filters">
          {[
            "all",
            "Căn Hộ",
            "Văn Phòng",
            "Biệt Thự",
            "Khách Sạn",
            "Thương Mại",
          ].map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${currentCat === cat ? "active" : ""}`}
              onClick={() => filterG(cat)}
            >
              {cat === "all" ? "Tất Cả" : cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div
            id="gallery-loading"
            style={{
              textAlign: "center",
              padding: "4rem",
              color: "var(--muted)",
              fontSize: "0.95rem",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                animation: "spin 1s linear infinite",
                display: "inline-block",
              }}
            >
              ⟳
            </div>
            <br />
            Đang tải công trình...
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            id="gallery-empty"
            style={{
              textAlign: "center",
              padding: "4rem",
              color: "var(--muted)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏗️</div>
            <div
              style={{
                fontSize: "1rem",
                marginBottom: "0.5rem",
                color: "var(--text)",
              }}
            >
              Chưa có công trình nào
            </div>
            <div style={{ fontSize: "0.85rem" }}>
              Vào trang Admin để thêm công trình đầu tiên
            </div>
          </div>
        ) : (
          <div
            className="gallery-grid rv d3"
            id="gallery-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                filteredItems.length === 1
                  ? "1fr"
                  : filteredItems.length <= 3
                  ? "repeat(3, 1fr)"
                  : "repeat(4, 1fr)",
              gridAutoRows: filteredItems.length <= 3 ? "280px" : "220px",
            }}
          >
            {filteredItems.map((item, i) => {
              const images = item.image
                ? item.image
                    .split(/[\s,\n\t]+/)
                    .filter((url) => url.trim() !== "")
                : [];
              const hasImg = images.length > 0;
              const mainImg = hasImg ? images[0] : "";
              const emoji = CAT_EMOJI[item.category] || "🏗️";
              const fallback = FALLBACK_BG[i % FALLBACK_BG.length];
              const bgStyle = hasImg
                ? `url('${encodeURI(mainImg)}') center/cover no-repeat`
                : fallback;
              const spanStyle =
                i === 0 && filteredItems.length >= 4
                  ? { gridColumn: "span 2", gridRow: "span 2" }
                  : i === 3 && filteredItems.length >= 5
                  ? { gridColumn: "span 2" }
                  : {};
              const idNum = item.id ? item.id.toString().replace("CT", "") : "";
              const year =
                idNum && !isNaN(idNum) ? new Date(+idNum).getFullYear() : "";

              return (
                <div
                  key={item.id}
                  className="g-item"
                  style={spanStyle}
                  onClick={() => handleOpenLightbox(item)}
                >
                  <div
                    className="g-bg"
                    style={{
                      background: bgStyle,
                      fontSize:
                        i === 0 && filteredItems.length >= 4 ? "9rem" : "5rem",
                    }}
                  >
                    {hasImg ? "" : emoji}
                  </div>
                  <div className="g-overlay"></div>
                  <div className="g-info">
                    <div className="g-cat">
                      {item.category} {year ? `· ${year}` : ""}{" "}
                      {images.length > 1 ? `(${images.length} ảnh)` : ""}
                    </div>
                    <div className="g-title">{item.title}</div>
                    <div className="g-area">
                      📍 {item.location || ""}{" "}
                      {item.size ? `· ${item.size}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ALBUM LIGHTBOX POPUP MODAL */}
      {activeProject && (
        <div className="lightbox-bg" onClick={() => setActiveProject(null)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setActiveProject(null)}
            >
              ✕
            </button>

            <div className="lightbox-main">
              {activeProject.imageList.length > 0 ? (
                <img
                  className="lightbox-img"
                  src={activeProject.imageList[activeImgIndex]}
                  alt={activeProject.title}
                />
              ) : (
                <div style={{ fontSize: "5rem" }}>
                  {CAT_EMOJI[activeProject.category] || "🏗️"}
                </div>
              )}

              {activeProject.imageList.length > 1 && (
                <>
                  <button
                    className="lightbox-arrow lightbox-arrow-left"
                    onClick={handlePrevImg}
                  >
                    ◀
                  </button>
                  <button
                    className="lightbox-arrow lightbox-arrow-right"
                    onClick={handleNextImg}
                  >
                    ▶
                  </button>
                </>
              )}
            </div>

            <div className="lightbox-side">
              <div className="lightbox-meta">
                <div className="lightbox-cat">{activeProject.category}</div>
                <h3 className="lightbox-title">{activeProject.title}</h3>
                <div
                  className="lightbox-desc"
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--muted)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {activeProject.location && (
                    <span>📍 Địa điểm: {activeProject.location}</span>
                  )}
                  {activeProject.size && (
                    <span>📐 Diện tích: {activeProject.size}</span>
                  )}
                  {activeProject.imageList.length > 1 && (
                    <span>
                      🖼️ Ảnh {activeImgIndex + 1} /{" "}
                      {activeProject.imageList.length}
                    </span>
                  )}
                </div>
              </div>

              {activeProject.imageList.length > 1 && (
                <div className="lightbox-thumbs">
                  {activeProject.imageList.map((imgUrl, idx) => (
                    <img
                      key={idx}
                      className={`lightbox-thumb ${
                        idx === activeImgIndex ? "active" : ""
                      }`}
                      src={imgUrl}
                      alt="Thumbnail"
                      onClick={() => setActiveImgIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CALCULATOR */}
      <section id="calc">
        <div className="sec-eyebrow rv">Công Cụ</div>
        <h2 className="sec-title rv d1">
          Tính Chi Phí{" "}
          <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
            Ngay & Luôn
          </em>
        </h2>
        <p className="sec-desc rv d2" style={{ marginBottom: "4rem" }}>
          Nhập thông tin để nhận ước tính chi phí nhanh. Báo giá chính xác sau
          khi khảo sát thực tế miễn phí.
        </p>
        <div className="calc-wrap rv">
          <div className="calc-form">
            <div className="calc-title-bar">Thông Tin Công Trình</div>
            <div className="form-row">
              <label className="form-label">Loại Dịch Vụ</label>
              <select
                className="form-select"
                value={calcParams.svc}
                onChange={(e) => {
                  setCalcParams({ ...calcParams, svc: +e.target.value });
                  setCalcActive(true);
                }}
              >
                <option value="95000">
                  Trần Thạch Cao Phẳng (từ 95.000đ/m²)
                </option>
                <option value="145000">Trần Giật Cấp (từ 145.000đ/m²)</option>
                <option value="180000">
                  Vách Ngăn Thạch Cao (từ 180.000đ/m²)
                </option>
                <option value="120000">
                  Phào Chỉ Trang Trí (từ 120.000đ/md)
                </option>
                <option value="55000">Bả Bột & Sơn Nước (từ 55.000đ/m²)</option>
                <option value="0">Trọn Gói Nhiều Hạng Mục</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Diện Tích (m²)</label>
              <div className="range-wrap">
                <div className="range-val">
                  <span>Diện tích</span>
                  <span>{calcParams.area} m²</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="5"
                  value={calcParams.area}
                  onChange={(e) => {
                    setCalcParams({ ...calcParams, area: +e.target.value });
                    setCalcActive(true);
                  }}
                />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Chất Lượng Vật Liệu</label>
              <select
                className="form-select"
                value={calcParams.mat}
                onChange={(e) => {
                  setCalcParams({ ...calcParams, mat: +e.target.value });
                  setCalcActive(true);
                }}
              >
                <option value="1.0">Tiêu Chuẩn</option>
                <option value="1.3">Cao Cấp (Knauf, USG)</option>
                <option value="1.6">Premium (Chống Ẩm / Chống Cháy)</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Loại Công Trình</label>
              <select
                className="form-select"
                value={calcParams.build}
                onChange={(e) => {
                  setCalcParams({ ...calcParams, build: +e.target.value });
                  setCalcActive(true);
                }}
              >
                <option value="1.0">Căn Hộ / Nhà Phố</option>
                <option value="1.1">Văn Phòng / Thương Mại</option>
                <option value="1.2">Biệt Thự / Cao Cấp</option>
                <option value="0.95">Nhà Xưởng / Kho Bãi</option>
              </select>
            </div>
            <button className="calc-btn" onClick={() => setCalcActive(true)}>
              🔢 Tính Chi Phí Ngay
            </button>
          </div>
          <div className="calc-result">
            <div className={`result-box ${calcActive ? "active" : ""}`}>
              <div className="result-label">Ước Tính Chi Phí Nhân Công</div>
              <div className="result-price">
                {calcParams.svc === 0
                  ? "Liên hệ báo giá"
                  : `${calcTotal.toLocaleString("vi-VN")}đ`}
              </div>
              <div className="result-unit">Chưa bao gồm VAT & vật liệu</div>
              <div className="result-bd">
                <div className="rb-item">
                  <span className="rb-label">Diện tích</span>
                  <span className="rb-val">{calcParams.area} m²</span>
                </div>
                <div className="rb-item">
                  <span className="rb-label">Đơn giá nhân công</span>
                  <span className="rb-val">
                    {calcParams.svc === 0
                      ? "Thoả thuận"
                      : `${calcParams.svc.toLocaleString("vi-VN")}đ/m²`}
                  </span>
                </div>
                <div className="rb-item">
                  <span className="rb-label">Hệ số vật liệu</span>
                  <span className="rb-val">× {calcParams.mat}</span>
                </div>
                <div className="rb-item">
                  <span className="rb-label">Hệ số công trình</span>
                  <span className="rb-val">× {calcParams.build}</span>
                </div>
                <div className="rb-div"></div>
                <div className="rb-item rb-total">
                  <span className="rb-label">Tổng ước tính</span>
                  <span className="rb-val">
                    {calcParams.svc === 0
                      ? "Liên hệ báo giá"
                      : `${calcTotal.toLocaleString("vi-VN")}đ`}
                  </span>
                </div>
              </div>
            </div>
            <div className="calc-note">
              <strong>⚠️ Lưu ý:</strong> Đây là ước tính tham khảo. Chi phí thực
              tế phụ thuộc vào hiện trạng công trình và độ phức tạp thiết kế.{" "}
              <strong>
                Liên hệ để được khảo sát và báo giá chính xác miễn phí.
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* MATERIALS */}
      <section id="materials">
        <div className="sec-eyebrow rv">Vật Liệu</div>
        <h2 className="sec-title rv d1">Nguồn Hàng Chính Hãng</h2>
        <p className="sec-desc rv d2" style={{ marginBottom: "0" }}>
          Phân phối trực tiếp từ nhà sản xuất và nhập khẩu ủy quyền. Đảm bảo
          nguồn gốc rõ ràng, đầy đủ CO/CQ.
        </p>
        <div className="mat-grid rv">
          <div className="mat-card">
            <div className="mat-ico-big">🧱</div>
            <div className="mat-brand">Knauf · USG · Vĩnh Tường</div>
            <div className="mat-name">Tấm Thạch Cao Tiêu Chuẩn</div>
            <div className="mat-desc">
              Tấm 9mm, 12mm, 15mm. Dùng cho trần phẳng, trần thả, vách ngăn
              thông thường.
            </div>
            <div className="mat-tags">
              <span className="mat-tag">9.5mm</span>
              <span className="mat-tag">12mm</span>
              <span className="mat-tag">15mm</span>
            </div>
          </div>
          <div className="mat-card">
            <div className="mat-ico-big">💧</div>
            <div className="mat-brand">Knauf Aquapanel</div>
            <div className="mat-name">Tấm Thạch Cao Chống Ẩm</div>
            <div className="mat-desc">
              Lõi thạch cao phụ gia chống ẩm đặc biệt. Dùng cho phòng tắm, bếp,
              khu vực ẩm ướt.
            </div>
            <div className="mat-tags">
              <span className="mat-tag">Chống Ẩm</span>
              <span className="mat-tag">12mm</span>
              <span className="mat-tag">Xanh Lá</span>
            </div>
          </div>
          <div className="mat-card">
            <div className="mat-ico-big">🔥</div>
            <div className="mat-brand">USG Sheetrock</div>
            <div className="mat-name">Tấm Thạch Cao Chống Cháy</div>
            <div className="mat-desc">
              Lõi chứa Micro Silica & sợi thủy tinh. Đạt tiêu chuẩn chống cháy
              PCCC quốc tế.
            </div>
            <div className="mat-tags">
              <span className="mat-tag">Chống Cháy</span>
              <span className="mat-tag">REI 60</span>
            </div>
          </div>
          <div className="mat-card">
            <div className="mat-ico-big">🔩</div>
            <div className="mat-brand">Vĩnh Tường · Gyproc</div>
            <div className="mat-name">Khung Thép Mạ Kẽm</div>
            <div className="mat-desc">
              Thanh C, U, V mạ kẽm nhúng nóng dày 0.45–0.55mm. Chống gỉ, bền 30
              năm.
            </div>
            <div className="mat-tags">
              <span className="mat-tag">Thanh C</span>
              <span className="mat-tag">Thanh U</span>
              <span className="mat-tag">Mạ Kẽm</span>
            </div>
          </div>
          <div className="mat-card">
            <div className="mat-ico-big">🌡️</div>
            <div className="mat-brand">Rockwool · Isover</div>
            <div className="mat-name">Bông Khoáng Cách Nhiệt</div>
            <div className="mat-desc">
              Bông khoáng mật độ cao. Cách nhiệt & cách âm vượt trội, không cháy
              lan.
            </div>
            <div className="mat-tags">
              <span className="mat-tag">Cách Âm</span>
              <span className="mat-tag">Cách Nhiệt</span>
            </div>
          </div>
          <div className="mat-card">
            <div className="mat-ico-big">🎨</div>
            <div className="mat-brand">Dulux · Jotun · Kova</div>
            <div className="mat-name">Bột Bả & Sơn Nước</div>
            <div className="mat-desc">
              Bột trét Matit, Sika. Sơn nội ngoại thất cao cấp. Đủ màu theo NCS,
              RAL, Pantone.
            </div>
            <div className="mat-tags">
              <span className="mat-tag">Nội Thất</span>
              <span className="mat-tag">Ngoại Thất</span>
            </div>
          </div>
          <div className="mat-card">
            <div className="mat-ico-big">🔧</div>
            <div className="mat-brand">Hilti · Fischer · Knauf</div>
            <div className="mat-name">Phụ Kiện Thi Công</div>
            <div className="mat-desc">
              Vít, băng lưới, hợp chất trám khe, kẹp trần, ty treo, nẹp góc inox
              chuyên dụng.
            </div>
            <div className="mat-tags">
              <span className="mat-tag">Vít</span>
              <span className="mat-tag">Băng Lưới</span>
              <span className="mat-tag">Nẹp Góc</span>
            </div>
          </div>
          <div className="mat-card">
            <div className="mat-ico-big">🚚</div>
            <div className="mat-brand">Giao Hàng Toàn TP.HCM</div>
            <div className="mat-name">Mua Sỉ & Lẻ</div>
            <div className="mat-desc">
              Giá sỉ ưu đãi từ 100m². Giao hàng trong ngày tại TP.HCM, Bình
              Dương, Long An.
            </div>
            <div className="mat-tags">
              <span className="mat-tag">Trong Ngày</span>
              <span className="mat-tag">Giá Sỉ</span>
              <span className="mat-tag">COD</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process">
        <div style={{ textAlign: "center" }}>
          <div className="sec-eyebrow rv" style={{ justifyContent: "center" }}>
            Quy Trình
          </div>
          <h2 className="sec-title rv d1" style={{ textAlign: "center" }}>
            5 Bước Đến Công Trình Hoàn Hảo
          </h2>
        </div>
        <div className="process-grid rv d2">
          <div className="proc-step">
            <div className="proc-num">01</div>
            <div className="proc-ico">📞</div>
            <div className="proc-name">Liên Hệ & Tư Vấn</div>
            <div className="proc-desc">
              Gọi hotline hoặc nhắn Zalo. Tư vấn sơ bộ giải pháp và vật liệu phù
              hợp.
            </div>
          </div>
          <div className="proc-step">
            <div className="proc-num">02</div>
            <div className="proc-ico">📐</div>
            <div className="proc-name">Khảo Sát Miễn Phí</div>
            <div className="proc-desc">
              Đội kỹ thuật đến đo đạc, đánh giá thực tế trong 24 giờ. Hoàn toàn
              miễn phí.
            </div>
          </div>
          <div className="proc-step">
            <div className="proc-num">03</div>
            <div className="proc-ico">📋</div>
            <div className="proc-name">Báo Giá & Ký HĐ</div>
            <div className="proc-desc">
              Báo giá chi tiết từng hạng mục. Ký hợp đồng cam kết tiến độ & chất
              lượng.
            </div>
          </div>
          <div className="proc-step">
            <div className="proc-num">04</div>
            <div className="proc-ico">⚒️</div>
            <div className="proc-name">Thi Công Chuyên Nghiệp</div>
            <div className="proc-desc">
              Đội thợ làm việc đúng tiến độ. Dọn dẹp sạch sẽ hàng ngày, báo cáo
              tiến độ.
            </div>
          </div>
          <div className="proc-step">
            <div className="proc-num">05</div>
            <div className="proc-ico">✅</div>
            <div className="proc-name">Bàn Giao & Bảo Hành</div>
            <div className="proc-desc">
              Nghiệm thu kỹ lưỡng. Bảo hành 24 tháng. Hỗ trợ bảo trì trọn đời.
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews">
        <div className="reviews-head">
          <div>
            <div className="sec-eyebrow rv">Khách Hàng Nói Gì</div>
            <h2 className="sec-title rv d1">Đánh Giá Thực Tế</h2>
          </div>
          <div className="rating-big rv">
            <div className="rating-num">4.9</div>
            <div className="r-stars">
              <div className="stars">★★★★★</div>
              <div className="rating-sub">Dựa trên 200+ đánh giá</div>
            </div>
          </div>
        </div>
        <div className="reviews-grid rv">
          <div className="review-card">
            <div className="review-q">"</div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              ThạchPro hoàn thành toàn bộ trần giật cấp và vách ngăn penthouse
              450m² chỉ trong 10 ngày. Bề mặt cực kỳ mịn, đường nét sắc sảo, đội
              thợ sạch sẽ và chuyên nghiệp. Rất hài lòng và sẽ giới thiệu cho
              bạn bè!
            </p>
            <div className="review-author">
              <div className="review-av">TT</div>
              <div>
                <div className="review-name">Anh Nguyễn Văn Tuấn</div>
                <div className="review-role">Chủ hộ Vinhomes Grand Park</div>
                <div className="review-proj">
                  🏠 Căn hộ 450m² · Trần giật cấp
                </div>
              </div>
            </div>
          </div>
          <div className="review-card">
            <div className="review-q">"</div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              Đội thợ rất chuyên nghiệp, đúng giờ và sạch sẽ. Báo giá minh bạch,
              không phát sinh. Văn phòng 1.200m² được hoàn thiện đúng theo bản
              vẽ thiết kế, chất lượng vượt kỳ vọng của ban lãnh đạo.
            </p>
            <div className="review-author">
              <div className="review-av">NH</div>
              <div>
                <div className="review-name">Chị Trần Hồng Nhung</div>
                <div className="review-role">Giám đốc Công ty TechViet</div>
                <div className="review-proj">🏢 Văn phòng 1.200m² · Quận 1</div>
              </div>
            </div>
          </div>
          <div className="review-card">
            <div className="review-q">"</div>
            <div className="review-stars">★★★★★</div>
            <p className="review-text">
              Mua vật liệu số lượng lớn cho dự án 300 căn hộ. Hàng đúng chủng
              loại, giao đúng hẹn, giá tốt hơn các đại lý khác. Dịch vụ hậu mãi
              cũng rất tốt. Sẽ tiếp tục hợp tác dài hạn.
            </p>
            <div className="review-author">
              <div className="review-av">MK</div>
              <div>
                <div className="review-name">Anh Lê Minh Khoa</div>
                <div className="review-role">Nhà thầu xây dựng, Bình Dương</div>
                <div className="review-proj">
                  🏗️ Dự án 300 căn hộ · Vật liệu sỉ
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="why">
        <div className="why-wrap">
          <div className="why-visual rv-l">
            <div className="why-card-main">
              <div className="why-grid-bg"></div>
              <div className="why-tag">Cam kết chất lượng</div>
              <div className="why-big">
                Tại Sao
                <br />
                Chọn
                <br />
                ThạchPro?
              </div>
            </div>
            <div className="why-float">
              <div className="why-float-num">500+</div>
              <div className="why-float-lbl">
                Công Trình
                <br />
                Hoàn Thành
              </div>
            </div>
          </div>
          <div className="rv-r">
            <div className="sec-eyebrow">Điểm Khác Biệt</div>
            <h2
              className="sec-title"
              dangerouslySetInnerHTML={{
                __html: content.why_title || "Chúng Tôi Cam Kết<br />Điều Này",
              }}
            ></h2>
            <div className="why-list">
              <div className="why-item">
                <div className="why-check">✓</div>
                <div>
                  <div className="why-item-title">
                    {content.why_item1_title ||
                      "Khảo Sát & Tư Vấn Miễn Phí 100%"}
                  </div>
                  <div className="why-item-desc">
                    {content.why_item1_desc ||
                      "Đội kỹ thuật đến tận nơi đo đạc, tư vấn giải pháp tối ưu. Không mất bất kỳ chi phí nào."}
                  </div>
                </div>
              </div>
              <div className="why-item">
                <div className="why-check">✓</div>
                <div>
                  <div className="why-item-title">
                    {content.why_item2_title ||
                      "Báo Giá Trọn Gói Không Phát Sinh"}
                  </div>
                  <div className="why-item-desc">
                    {content.why_item2_desc ||
                      "Hợp đồng rõ ràng từng hạng mục. Cam kết không phát sinh chi phí ngoài thỏa thuận ban đầu."}
                  </div>
                </div>
              </div>
              <div className="why-item">
                <div className="why-check">✓</div>
                <div>
                  <div className="why-item-title">
                    {content.why_item3_title || "Đội Thợ Được Đào Tạo Bài Bản"}
                  </div>
                  <div className="why-item-desc">
                    {content.why_item3_desc ||
                      "30+ thợ lành nghề chuyên về thạch cao, được đào tạo kỹ thuật theo tiêu chuẩn Knauf & USG."}
                  </div>
                </div>
              </div>
              <div className="why-item">
                <div className="why-check">✓</div>
                <div>
                  <div className="why-item-title">
                    {content.why_item4_title ||
                      "Bảo Hành 24 Tháng Toàn Bộ Hạng Mục"}
                  </div>
                  <div className="why-item-desc">
                    {content.why_item4_desc ||
                      "Bảo hành dài nhất trong ngành. Hỗ trợ bảo trì sau bảo hành với chi phí ưu đãi."}
                  </div>
                </div>
              </div>
              <div className="why-item">
                <div className="why-check">✓</div>
                <div>
                  <div className="why-item-title">
                    {content.why_item5_title ||
                      "Vật Liệu Chính Hãng Có Chứng Nhận"}
                  </div>
                  <div className="why-item-desc">
                    {content.why_item5_desc ||
                      "Chỉ sử dụng vật liệu có CO/CQ đầy đủ. Đại lý ủy quyền Knauf, USG, Vĩnh Tường."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="cta-inner">
          <div className="cta-text rv">
            <h2
              dangerouslySetInnerHTML={{
                __html:
                  content.cta_title || "Bắt Đầu Dự Án<br>Của Bạn Hôm Hiện Tại",
              }}
            ></h2>
            <p
              dangerouslySetInnerHTML={{
                __html:
                  content.cta_desc ||
                  "Liên hệ ngay để được tư vấn miễn phí và nhận báo giá trong 24 giờ. Đội ngũ ThạchPro luôn sẵn sàng biến ý tưởng của bạn thành hiện thực.",
              }}
            ></p>
          </div>
          <div className="cta-actions rv d2">
            <a
              href={`tel:${content.contact_phone || "0901234567"}`}
              className="btn-cta-dark"
              dangerouslySetInnerHTML={{
                __html: content.cta_btn || "📞 Gọi Ngay: 0901 234 567",
              }}
            ></a>
            <div className="cta-phone-big">
              {content.contact_phone || "0901 234 567"}
            </div>
            <div className="cta-time">Thứ 2 – Chủ Nhật · 7:00 – 18:00</div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="contact">
        <div className="sec-eyebrow rv">Liên Hệ</div>
        <h2 className="sec-title rv d1">
          Đặt Lịch Khảo Sát
          <br />
          <em style={{ color: "var(--accent)", fontStyle: "italic" }}>
            Miễn Phí
          </em>
        </h2>
        <p className="sec-desc rv d2" style={{ marginBottom: "4rem" }}>
          Điền form bên dưới — đội kỹ thuật sẽ liên hệ lại trong vòng{" "}
          <strong style={{ color: "var(--accent)" }}>30 phút</strong> để sắp xếp
          lịch khảo sát.
        </p>
        <div className="contact-wrap rv">
          <div>
            <div className="ci-item">
              <div className="ci-icon">📞</div>
              <div>
                <div className="ci-label">Hotline</div>
                <div className="ci-val">
                  {content.contact_phone || "0901 234 567"}
                </div>
                <div className="ci-sub">
                  {content.contact_hours || "Thứ 2 – Chủ Nhật · 7:00 – 18:00"}
                </div>
              </div>
            </div>
            <div className="ci-item">
              <div className="ci-icon">💬</div>
              <div>
                <div className="ci-label">Zalo</div>
                <div className="ci-val">
                  {content.contact_zalo || "0901 234 567"}
                </div>
                <div className="ci-sub">
                  Nhắn tin nhận báo giá nhanh trong ngày
                </div>
              </div>
            </div>
            <div className="ci-item">
              <div className="ci-icon">📧</div>
              <div>
                <div className="ci-label">Email</div>
                <div className="ci-val">
                  {content.contact_email || "thachpro@gmail.com"}
                </div>
                <div className="ci-sub">Phản hồi trong 2 giờ làm việc</div>
              </div>
            </div>
            <div className="ci-item">
              <div className="ci-icon">📍</div>
              <div>
                <div className="ci-label">Showroom & Văn Phòng</div>
                <div className="ci-val">
                  {content.contact_address ||
                    "123 Nguyễn Văn Linh, Quận 7, TP.HCM"}
                </div>
                <div className="ci-sub">TP. Hồ Chí Minh · Gần cầu Kênh Tẻ</div>
              </div>
            </div>
            <div className="ci-item">
              <div className="ci-icon">🚚</div>
              <div>
                <div className="ci-label">Khu Vực Phục Vụ</div>
                <div className="ci-val">TP.HCM · Bình Dương · Long An</div>
                <div className="ci-sub">
                  Khảo sát và giao hàng tận nơi miễn phí
                </div>
              </div>
            </div>
          </div>
          <div className="contact-form-box">
            <div className="cf-title">Gửi Yêu Cầu Báo Giá</div>
            <form onSubmit={handleFormSubmit}>
              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label">Họ & Tên *</label>
                  <input
                    className="cf-input"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="cf-field">
                  <label className="cf-label">Số Điện Thoại *</label>
                  <input
                    className="cf-input"
                    type="tel"
                    placeholder="0901 234 567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label">Email</label>
                  <input
                    className="cf-input"
                    type="email"
                    placeholder="email@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="cf-field">
                  <label className="cf-label">Dịch Vụ Quan Tâm</label>
                  <select
                    className="cf-select"
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                  >
                    <option value="">-- Chọn dịch vụ --</option>
                    <option>Trần Thạch Cao Phẳng</option>
                    <option>Trần Giật Cấp</option>
                    <option>Vách Ngăn Thạch Cao</option>
                    <option>Phào Chỉ Trang Trí</option>
                    <option>Bả Bột & Sơn Nước</option>
                    <option>Mua Vật Liệu Sỉ/Lẻ</option>
                    <option>Tư Vấn Trọn Gói</option>
                  </select>
                </div>
              </div>
              <div className="cf-row">
                <div className="cf-field">
                  <label className="cf-label">Diện Tích (m²)</label>
                  <input
                    className="cf-input"
                    type="text"
                    placeholder="VD: 50 m²"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                  />
                </div>
                <div className="cf-field">
                  <label className="cf-label">Địa Điểm Công Trình</label>
                  <input
                    className="cf-input"
                    type="text"
                    placeholder="Quận / Huyện, TP.HCM"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="cf-field">
                <label className="cf-label">Ghi Chú / Yêu Cầu Thêm</label>
                <textarea
                  className="cf-textarea"
                  placeholder="Mô tả thêm yêu cầu của bạn, thời gian thuận tiện để khảo sát..."
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                ></textarea>
              </div>
              <button type="submit" className="cf-submit">
                📩 Gửi Yêu Cầu Báo Giá
              </button>
              <div className="cf-success" id="cf-success">
                ✅ Gửi thành công! Chúng tôi sẽ liên hệ lại trong vòng 30 phút.
                Cảm ơn bạn đã tin tưởng ThạchPro!
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* GOOGLE MAPS */}
      <section id="map-section">
        <div className="map-wrap">
          <iframe
            className="map-frame"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0282977647386!2d106.71720767587655!3d10.732498089396068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f9ab4c3a6bf%3A0x4a8a7e5db1d31e1!2zTmd1eeG7hW4gVsSDbiBMaW5oLCBRdeG6rW4gNywgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2svn!4v1700000000000"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Vị trí ThạchPro"
          />
          <div className="map-card">
            <div className="map-card-title">
              📍 <span>ThạchPro</span> Showroom
            </div>
            <div className="map-info-row">
              <span className="map-ico">🏠</span>
              <span>123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP.HCM</span>
            </div>
            <div className="map-info-row">
              <span className="map-ico">📞</span>
              <span>{content.contact_phone || "0901 234 567"}</span>
            </div>
            <div className="map-info-row">
              <span className="map-ico">🕐</span>
              <span>7:00 – 18:00 · Thứ 2 – Chủ Nhật</span>
            </div>
            <div className="map-info-row">
              <span className="map-ico">🚗</span>
              <span>Có bãi đậu xe miễn phí</span>
            </div>
            <a
              href="https://maps.google.com/?q=Nguyễn+Văn+Linh+Quận+7+TP.HCM"
              target="_blank"
              rel="noopener noreferrer"
              className="map-cta-btn"
            >
              🗺️ Xem Trên Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ZALO + PHONE FLOAT */}
      <div id="zalo-float">
        <div className="zf-row">
          <span className="zf-label">Gọi ngay</span>
          <a
            href={`tel:${content.contact_phone || "0901234567"}`}
            className="phone-btn"
            title="Gọi điện ngay"
          >
            📞
          </a>
        </div>
        <div className="zf-row">
          <a
            href={`https://zalo.me/${content.contact_phone || "0901234567"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="zalo-btn"
            title="Chat Zalo"
          >
            <span
              style={{
                background: "white",
                color: "#0068FF",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "900",
                flexShrink: 0,
              }}
            >
              Z
            </span>
            Chat Zalo
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="logo-wrap">
              <div className="logo-icon">🏠</div>
              <span className="logo-text">
                Thạch<span>Pro</span>
              </span>
            </a>
            <p
              dangerouslySetInnerHTML={{
                __html:
                  content.footer_desc ||
                  "Đơn vị thi công thạch cao và cung cấp vật liệu xây dựng chuyên nghiệp tại TP.HCM từ năm 2008.",
              }}
            ></p>
            <div className="social-row">
              <a href="#" className="social-btn">
                f
              </a>
              <a href="#" className="social-btn">
                Z
              </a>
              <a href="#" className="social-btn">
                ▶
              </a>
              <a href="#" className="social-btn">
                ♪
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Dịch Vụ</h4>
            <ul>
              <li>
                <a href="#services">→ Trần Thạch Cao Phẳng</a>
              </li>
              <li>
                <a href="#services">→ Trần Giật Cấp</a>
              </li>
              <li>
                <a href="#services">→ Vách Ngăn Nhẹ</a>
              </li>
              <li>
                <a href="#services">→ Phào Chỉ Trang Trí</a>
              </li>
              <li>
                <a href="#services">→ Bả Bột & Sơn Nước</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Vật Liệu</h4>
            <ul>
              <li>
                <a href="#materials">→ Tấm Thạch Cao Knauf</a>
              </li>
              <li>
                <a href="#materials">→ Tấm Thạch Cao USG</a>
              </li>
              <li>
                <a href="#materials">→ Khung Thép Mạ Kẽm</a>
              </li>
              <li>
                <a href="#materials">→ Bông Khoáng</a>
              </li>
              <li>
                <a href="#materials">→ Bột Bả & Sơn Nước</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Liên Hệ</h4>
            <div className="fci">
              <span className="fci-ico">📞</span>
              <div>
                <strong>{content.contact_phone || "0901 234 567"}</strong>
                <br />
                <small>{content.contact_hours || "Hotline 7:00–18:00"}</small>
              </div>
            </div>
            <div className="fci">
              <span className="fci-ico">💬</span>
              <div>Zalo: {content.contact_zalo || "0901 234 567"}</div>
            </div>
            <div className="fci">
              <span className="fci-ico">📧</span>
              <div>{content.contact_email || "thachpro@gmail.com"}</div>
            </div>
            <div className="fci">
              <span className="fci-ico">📍</span>
              <div>
                {content.contact_address ||
                  "123 Nguyễn Văn Linh, Quận 7, TP.HCM"}
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © 2024 <span>{content.brand_name || "ThạchPro"}</span>. Tất cả quyền
            được bảo lưu.
          </p>
          <div className="cert-row">
            <div className="cert-badge">Knauf Partner</div>
            <div className="cert-badge">USG Authorized</div>
            <div className="cert-badge">ISO 9001</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
