//
//  CUTESurroundingCell.swift
//  currant
//
//  Created by Foster Yin on 10/28/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTESurroundingCell)
class CUTESurroundingCell: UITableViewCell {

    let nameLabel:UILabel!
    let typeImageView:UIImageView!
    let typeButton:UIButton!
    let durationButton:UIButton!
    let removeButton:UIButton!

    // MARK: - Private Var
    let innerView:UIView!
    var isBorderAdded:Bool = false

    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
        typeImageView = UIImageView(image: UIImage(named: "icon-university"))
        typeImageView.contentMode = UIViewContentMode.center
        nameLabel = UILabel()
        nameLabel.font = UIFont.systemFont(ofSize: 14)
        nameLabel.textColor = UIColor(hex6: 0x666666)

        typeButton = UIButton()
        typeButton.setImage(UIImage(named: "icon-down-arrow"), for: UIControlState())
        typeButton.setTitleColor(UIColor(hex6: 0x999999), for: UIControlState())
        typeButton.titleLabel?.font = UIFont.systemFont(ofSize: 12)

        durationButton = UIButton()
        durationButton.setImage(UIImage(named: "icon-down-arrow"), for: UIControlState())
        durationButton.setTitleColor(UIColor(hex6: 0x999999), for: UIControlState())
        durationButton.titleLabel?.font = UIFont.systemFont(ofSize: 12)


        removeButton = UIButton()
        removeButton.setImage(UIImage(named: "button-remove"), for: UIControlState())

        innerView = UIView()


        super.init(style: style, reuseIdentifier: reuseIdentifier)

        innerView.addSubview(typeImageView)
        innerView.addSubview(nameLabel)
        innerView.addSubview(typeButton)
        innerView.addSubview(durationButton)
        innerView.addSubview(removeButton)
        self.contentView.addSubview(innerView)

        self.backgroundColor = UIColor.clear
        self.contentView.backgroundColor = UIColor.clear
        self.innerView.backgroundColor = UIColor(hex6:0xffffff)
    }


    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }


    override func layoutSubviews() {
        super.layoutSubviews()

        let contentViewTopMargin:CGFloat = 13.0
        let imageOffset:CGFloat = 2.0
        let leftMargin:CGFloat = 10.0
        let topMargin:CGFloat = 8.0
        let imageSideLength:CGFloat = 20;
        self.innerView.frame = CGRect(x: 0, y: contentViewTopMargin, width: self.frame.size.width, height: self.frame.size.height - contentViewTopMargin)

        self.selectedBackgroundView?.frame = self.innerView.frame


        self.typeImageView.frame = CGRect(x: leftMargin - imageOffset, y: topMargin, width: imageSideLength, height: imageSideLength)
        let nameLabelLeftMargin = (leftMargin + imageSideLength + 5)
        let nameLabelHeight:CGFloat = 20.0
        self.nameLabel.frame = CGRect(x: nameLabelLeftMargin, y: topMargin, width: self.innerView.frame.size.width - nameLabelLeftMargin * 2, height: nameLabelHeight)
        self.removeButton.frame = CGRect(x: self.innerView.frame.size.width - leftMargin - imageSideLength, y: topMargin, width: imageSideLength, height: imageSideLength)

        let typeButtonSize  = getTypeButtonSize(self.typeButton)
        self.typeButton.frame = CGRect(x: leftMargin, y: self.innerView.frame.size.height - (typeButtonSize.height + topMargin), width: typeButtonSize.width, height: typeButtonSize.height)
        layoutTypeButtonContent(self.typeButton)
        let durationButtonSize = getDurationButtonSize(self.durationButton)
        self.durationButton.frame = CGRect(x: (leftMargin + typeButtonSize.width), y: self.innerView.frame.size.height - (durationButtonSize.height + topMargin), width: durationButtonSize.width, height: durationButtonSize.height)
        layoutDurationButtonContent(self.durationButton)
        //TODO UIEdgeInsets what?
        if (!isBorderAdded) {
            self.innerView.addTopBorder(with: UIColor(hex6: 0xe0e0e0), andWidth: 1)
            self.innerView.addBottomBorder(with: UIColor(hex6: 0xe0e0e0), andWidth: 1)
            self.durationButton.addLeftBorder(with: UIColor(hex6: 0xcccccc), andWidth: 1)
            self.isBorderAdded = true
        }
    }


    // MARK: - Private
    func getTypeButtonSize(_ button:UIButton) -> CGSize {
        var text = ""
        if button.titleLabel?.text != nil {
            text = (button.titleLabel?.text)!
        }
        let textSize = (text as NSString).boundingRect(with: CGSize(width: 1000, height: 1000), options: NSStringDrawingOptions.usesLineFragmentOrigin, attributes: [NSFontAttributeName: button.titleLabel!.font], context: nil)
        let imageSize = CGSize(width: 8, height: 8)
        let spacing:CGFloat = 13
        let contentMargin:CGFloat = 13
        return CGSize(width: textSize.width + imageSize.width + spacing + contentMargin, height: 20)
    }

    func layoutTypeButtonContent(_ button:UIButton) {
        let textSize = button.titleLabel?.sizeThatFits(CGSize(width: 100, height: 20))
        let imageSize = CGSize(width: 8, height: 8)
        let spacing:CGFloat = 13
        let contentMargin:CGFloat = 13

        button.titleEdgeInsets = UIEdgeInsetsMake(0, -imageSize.width - spacing, 0, imageSize.width)
        button.imageEdgeInsets = UIEdgeInsetsMake(0, textSize!.width + spacing, 0, -textSize!.width)
        button.contentEdgeInsets = UIEdgeInsetsMake(0, -contentMargin, 0, 0);
    }

    func getDurationButtonSize(_ button:UIButton) -> CGSize {
        var text = ""
        if button.titleLabel?.text != nil {
            text = (button.titleLabel?.text)!
        }
        let textSize = (text as NSString).boundingRect(with: CGSize(width: 1000, height: 1000), options: NSStringDrawingOptions.usesLineFragmentOrigin, attributes: [NSFontAttributeName: button.titleLabel!.font], context: nil)
        let imageSize = CGSize(width: 8, height: 8)
        let spacing:CGFloat = 13
        let contentMargin:CGFloat = 13
        return CGSize(width: textSize.width + imageSize.width + spacing + contentMargin * 2, height: 20)
    }

    func layoutDurationButtonContent(_ button:UIButton) {
        let textSize = button.titleLabel?.sizeThatFits(CGSize(width: 100, height: 20))
        let imageSize = CGSize(width: 8, height: 8)
        let spacing:CGFloat = 13

        button.titleEdgeInsets = UIEdgeInsetsMake(0, -imageSize.width - spacing, 0, imageSize.width)
        button.imageEdgeInsets = UIEdgeInsetsMake(0, textSize!.width + spacing, 0, -textSize!.width)
    }
}
