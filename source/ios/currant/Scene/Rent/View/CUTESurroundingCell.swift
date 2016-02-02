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
        typeImageView.contentMode = UIViewContentMode.Center
        nameLabel = UILabel()
        nameLabel.font = UIFont.systemFontOfSize(14)
        nameLabel.textColor = UIColor(hex6: 0x666666)

        typeButton = UIButton()
        typeButton.setImage(UIImage(named: "icon-down-arrow"), forState: UIControlState.Normal)
        typeButton.setTitleColor(UIColor(hex6: 0x999999), forState: UIControlState.Normal)
        typeButton.titleLabel?.font = UIFont.systemFontOfSize(12)

        durationButton = UIButton()
        durationButton.setImage(UIImage(named: "icon-down-arrow"), forState: UIControlState.Normal)
        durationButton.setTitleColor(UIColor(hex6: 0x999999), forState: UIControlState.Normal)
        durationButton.titleLabel?.font = UIFont.systemFontOfSize(12)


        removeButton = UIButton()
        removeButton.setImage(UIImage(named: "button-remove"), forState: UIControlState.Normal)

        innerView = UIView()


        super.init(style: style, reuseIdentifier: reuseIdentifier)

        innerView.addSubview(typeImageView)
        innerView.addSubview(nameLabel)
        innerView.addSubview(typeButton)
        innerView.addSubview(durationButton)
        innerView.addSubview(removeButton)
        self.contentView.addSubview(innerView)

        self.backgroundColor = UIColor.clearColor()
        self.contentView.backgroundColor = UIColor.clearColor()
        self.innerView.backgroundColor = UIColor(hex6:0xffffff)
    }


    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(selected: Bool, animated: Bool) {
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
        self.innerView.frame = CGRectMake(0, contentViewTopMargin, self.frame.size.width, self.frame.size.height - contentViewTopMargin)

        self.selectedBackgroundView?.frame = self.innerView.frame


        self.typeImageView.frame = CGRectMake(leftMargin - imageOffset, topMargin, imageSideLength, imageSideLength)
        let nameLabelLeftMargin = (leftMargin + imageSideLength + 5)
        let nameLabelHeight:CGFloat = 20.0
        self.nameLabel.frame = CGRectMake(nameLabelLeftMargin, topMargin, self.innerView.frame.size.width - nameLabelLeftMargin * 2, nameLabelHeight)
        self.removeButton.frame = CGRectMake(self.innerView.frame.size.width - leftMargin - imageSideLength, topMargin, imageSideLength, imageSideLength)

        let typeButtonSize  = getTypeButtonSize(self.typeButton)
        self.typeButton.frame = CGRectMake(leftMargin, self.innerView.frame.size.height - (typeButtonSize.height + topMargin), typeButtonSize.width, typeButtonSize.height)
        layoutTypeButtonContent(self.typeButton)
        let durationButtonSize = getDurationButtonSize(self.durationButton)
        self.durationButton.frame = CGRectMake((leftMargin + typeButtonSize.width), self.innerView.frame.size.height - (durationButtonSize.height + topMargin), durationButtonSize.width, durationButtonSize.height)
        layoutDurationButtonContent(self.durationButton)
        //TODO UIEdgeInsets what?
        if (!isBorderAdded) {
            self.innerView.addTopBorderWithColor(UIColor(hex6: 0xe0e0e0), andWidth: 1)
            self.innerView.addBottomBorderWithColor(UIColor(hex6: 0xe0e0e0), andWidth: 1)
            self.durationButton.addLeftBorderWithColor(UIColor(hex6: 0xcccccc), andWidth: 1)
            self.isBorderAdded = true
        }
    }


    // MARK: - Private
    func getTypeButtonSize(button:UIButton) -> CGSize {
        var text = ""
        if button.titleLabel?.text != nil {
            text = (button.titleLabel?.text)!
        }
        let textSize = (text as NSString).boundingRectWithSize(CGSizeMake(1000, 1000), options: NSStringDrawingOptions.UsesLineFragmentOrigin, attributes: [NSFontAttributeName: button.titleLabel!.font], context: nil)
        let imageSize = CGSizeMake(8, 8)
        let spacing:CGFloat = 13
        let contentMargin:CGFloat = 13
        return CGSizeMake(textSize.width + imageSize.width + spacing + contentMargin, 20)
    }

    func layoutTypeButtonContent(button:UIButton) {
        let textSize = button.titleLabel?.sizeThatFits(CGSizeMake(100, 20))
        let imageSize = CGSizeMake(8, 8)
        let spacing:CGFloat = 13
        let contentMargin:CGFloat = 13

        button.titleEdgeInsets = UIEdgeInsetsMake(0, -imageSize.width - spacing, 0, imageSize.width)
        button.imageEdgeInsets = UIEdgeInsetsMake(0, textSize!.width + spacing, 0, -textSize!.width)
        button.contentEdgeInsets = UIEdgeInsetsMake(0, -contentMargin, 0, 0);
    }

    func getDurationButtonSize(button:UIButton) -> CGSize {
        var text = ""
        if button.titleLabel?.text != nil {
            text = (button.titleLabel?.text)!
        }
        let textSize = (text as NSString).boundingRectWithSize(CGSizeMake(1000, 1000), options: NSStringDrawingOptions.UsesLineFragmentOrigin, attributes: [NSFontAttributeName: button.titleLabel!.font], context: nil)
        let imageSize = CGSizeMake(8, 8)
        let spacing:CGFloat = 13
        let contentMargin:CGFloat = 13
        return CGSizeMake(textSize.width + imageSize.width + spacing + contentMargin * 2, 20)
    }

    func layoutDurationButtonContent(button:UIButton) {
        let textSize = button.titleLabel?.sizeThatFits(CGSizeMake(100, 20))
        let imageSize = CGSizeMake(8, 8)
        let spacing:CGFloat = 13

        button.titleEdgeInsets = UIEdgeInsetsMake(0, -imageSize.width - spacing, 0, imageSize.width)
        button.imageEdgeInsets = UIEdgeInsetsMake(0, textSize!.width + spacing, 0, -textSize!.width)
    }
}
