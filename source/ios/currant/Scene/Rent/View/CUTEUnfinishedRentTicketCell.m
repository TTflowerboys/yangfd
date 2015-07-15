//
//  CUTEUnfinishedRentTicketCell.m
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUnfinishedRentTicketCell.h"
#import "CUTEUnfinishedRentTicketPlaceholderImageView.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "MasonryMake.h"
#import "BBTPagingView.h"
#import "NSURL+Assets.h"
#import "UIImageView+Assets.h"
#import "NSObject+Attachment.h"

@interface CUTEUnfinishedRentTicketCell () <BBTPagingViewViewDataSource, BBTPagingViewViewDelegate> {

    BBTPagingView *_scrollImageView;

    CUTEUnfinishedRentTicketPlaceholderImageView *_placeholderView;

    UIView *_textContainerView;

    UILabel *_nameLabel;

    UILabel *_typeLabel;

    UIButton *_editButton;
}

@property (nonatomic, retain) CUTETicket *ticket;

@end

@implementation CUTEUnfinishedRentTicketCell

#define IMAGE_VIEW_HEIGHT 200
#define TEXT_VIEW_HEIGHT 68
#define EDIT_BUTTON_WIDTH 68


- (id)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier
{
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (self)
    {
        self.backgroundColor = CUTE_BACKGROUND_COLOR;
        self.selectionStyle = UITableViewCellSeparatorStyleNone;

        _placeholderView = [[CUTEUnfinishedRentTicketPlaceholderImageView alloc] initWithFrame:self.contentView.bounds];
        [self.contentView addSubview:_placeholderView];

        _scrollImageView = [[BBTPagingView alloc] init];
        [self.contentView addSubview:_scrollImageView];
        _scrollImageView.delegate = self;
        _scrollImageView.dateSource = self;
        //http://stackoverflow.com/questions/6636844/uiscrollview-inside-uitableviewcell-touch-detect
        //make scrollview can pass touch to tableviewcell and responsable for pan
        [_scrollImageView setUserInteractionEnabled:NO];
        [self.contentView addGestureRecognizer:_scrollImageView.panGestureRecognizer];

        _textContainerView = [[UIView alloc] init];
        [self.contentView addSubview:_textContainerView];
        _textContainerView.backgroundColor = [UIColor whiteColor];

        UIView *leftBorder = [UIView new];
        leftBorder.backgroundColor = CUTE_MAIN_COLOR;
        [_textContainerView addSubview:leftBorder];

        _nameLabel = [UILabel new];
        _nameLabel.font = [UIFont systemFontOfSize:16];
        _nameLabel.textColor = HEXCOLOR(0x666666, 1);
        _nameLabel.numberOfLines = 0;
        [_textContainerView addSubview:_nameLabel];

        _typeLabel = [UILabel new];
        _typeLabel.font = [UIFont systemFontOfSize:11];
        _typeLabel.textColor = CUTE_MAIN_COLOR;
        [_textContainerView addSubview:_typeLabel];


        _editButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [_editButton setImage:IMAGE(@"icon-rent-edit") forState:UIControlStateNormal];
        [_editButton setBackgroundColor:CUTE_MAIN_COLOR];
        _editButton.userInteractionEnabled = NO;//pass touch to tableview cell
        [self.contentView addSubview:_editButton];


        MakeBegin(self.contentView)
        MakeLeftEqualTo(self.left);
        MakeRighEqualTo(self.right);
        MakeTopEqualTo(self.top);
        MakeBottomEqualTo(self.bottom).offset(-10);
        MakeEnd

        MakeBegin(_placeholderView)
        MakeEdgesEqualTo(self.contentView);
        MakeEnd

        MakeBegin(_scrollImageView)
        MakeTopEqualTo(self.contentView.top);
        MakeLeftEqualTo(self.contentView.left);
        MakeRighEqualTo(self.contentView.right);
        MakeBottomEqualTo(self.contentView.top).offset(IMAGE_VIEW_HEIGHT);
        MakeEnd

        MakeBegin(_textContainerView)
        MakeTopEqualTo(_scrollImageView.bottom);
        MakeLeftEqualTo(self.contentView.left);
        MakeBottomEqualTo(self.contentView.bottom);
        MakeRighEqualTo(self.contentView.right).offset(-EDIT_BUTTON_WIDTH);
        MakeEnd

        MakeBegin(leftBorder)
        MakeTopEqualTo(_textContainerView.top);
        MakeBottomEqualTo(_textContainerView.bottom);
        MakeLeftEqualTo(_textContainerView.left);
        MakeRighEqualTo(_textContainerView.left).offset(8);
        MakeEnd

        MakeBegin(_nameLabel)
        MakeLeftEqualTo(_textContainerView.left).offset(18);
        MakeTopEqualTo(_textContainerView.top).offset(5);
        MakeRighEqualTo(_textContainerView.right).offset(-10);
        MakeBottomEqualTo(_textContainerView.bottom).offset(-14);
        MakeEnd

        MakeBegin(_typeLabel)
        MakeLeftEqualTo(_nameLabel.left);
        MakeBottomEqualTo(_textContainerView.bottom).offset(-3);
        MakeRighEqualTo(_textContainerView.right).offset(-10);
        MakeEnd

        MakeBegin(_editButton)
        MakeLeftEqualTo(_textContainerView.right);
        MakeRighEqualTo(self.contentView.right);
        MakeTopEqualTo(_textContainerView.top);
        MakeBottomEqualTo(self.contentView.bottom);
        MakeEnd

    }
    return self;
}


- (void)updateWithTicket:(CUTETicket *)ticket {

    [_scrollImageView updateFrame:CGRectMake(0, 0, self.bounds.size.width, IMAGE_VIEW_HEIGHT)];
    self.ticket = ticket;

    if (IsArrayNilOrEmpty(ticket.property.realityImages)) {
        [_scrollImageView reloadWithPageCount:0];
        [_scrollImageView setHidden:YES];
        [_placeholderView setHidden:NO];
    }
    else {
        [_scrollImageView reloadWithPageCount:ticket.property.realityImages.count];
        [_scrollImageView setHidden:NO];
        [_placeholderView setHidden:YES];
    }
    [_nameLabel setText:ticket.titleForDisplay];
    [_typeLabel setText:ticket.rentType.value];


}

#pragma mark - BBTPagingView


- (UIView *)pageViewAtIndex:(NSInteger)index {
    NSString *identifier = [self.ticket.property.realityImages objectAtIndex:index];
    UIImageView *imageView = [_scrollImageView dequeueReusablePageViewWithReuseIdentifier:identifier];
    if (!imageView) {
        imageView = [[UIImageView alloc] init];
        imageView.frame = _scrollImageView.bounds;
        imageView.contentMode = UIViewContentModeScaleAspectFill;
        imageView.clipsToBounds = YES;
    }
    
    [imageView setImage:nil];
    [imageView setImageWithAssetURL:[NSURL URLWithString:identifier] thumbnailWidth:imageView.frame.size.width];
    imageView.attachment = identifier;

    return imageView;
}

- (void)onPagingViewScrollToIndex:(NSInteger)index {

}

@end
