//
//  CUTEUnfinishedRentTicketCell.m
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUnfinishedRentTicketCell.h"
#import "BBTScrollImageView.h"
#import "CUTEUnfinishedRentTicketPlaceholderImageView.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "MasonryMake.h"
#import "UIView+Border.h"

@interface CUTEUnfinishedRentTicketCell () {

    BBTScrollImageView *_scrollImageView;

    CUTEUnfinishedRentTicketPlaceholderImageView *_placeholderView;

    UIView *_textContainerView;

    UILabel *_nameLabel;

    UILabel *_typeLabel;

    UIButton *_editButton;
}

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
        self.backgroundColor = [UIColor clearColor];

        _placeholderView = [[CUTEUnfinishedRentTicketPlaceholderImageView alloc] initWithFrame:self.contentView.bounds];
        [self.contentView addSubview:_placeholderView];

        _scrollImageView = [[BBTScrollImageView alloc] initWithFrame:CGRectMake(0, 0, RectWidth(self.contentView.bounds), IMAGE_VIEW_HEIGHT)];
        [self.contentView addSubview:_scrollImageView];

        _textContainerView = [[UIView alloc] initWithFrame:CGRectMake(0, IMAGE_VIEW_HEIGHT, RectWidth(self.contentView.bounds) - EDIT_BUTTON_WIDTH, TEXT_VIEW_HEIGHT)];
        [self.contentView addSubview:_textContainerView];
        _textContainerView.backgroundColor = [UIColor whiteColor];
        [_textContainerView addLeftBorderWithColor:CUTE_MAIN_COLOR andWidth:8];

        _nameLabel = [UILabel new];
        _nameLabel.font = [UIFont systemFontOfSize:16];
        _nameLabel.textColor = HEXCOLOR(0x666666, 1);
        _nameLabel.numberOfLines = 0;
        [_textContainerView addSubview:_nameLabel];

        _typeLabel = [UILabel new];
        _typeLabel.font = [UIFont systemFontOfSize:11];
        _typeLabel.textColor = CUTE_MAIN_COLOR;
        [_textContainerView addSubview:_typeLabel];

        MakeBegin(self.contentView)
        MakeLeftEqualTo(self.left);
        MakeRighEqualTo(self.right);
        MakeTopEqualTo(self.top);
        MakeBottomEqualTo(self.bottom).offset(-10);
        MakeEnd

        MakeBegin(_placeholderView)
        MakeEdgesEqualTo(self.contentView);
        MakeEnd

        MakeBegin(_nameLabel)
        MakeLeftEqualTo(_textContainerView.left).offset(18);
        MakeTopEqualTo(_textContainerView.top).offset(10);
        MakeRighEqualTo(_textContainerView.right).offset(-10);
        MakeBottomEqualTo(_textContainerView.bottom).offset(-24);
        MakeEnd

        MakeBegin(_typeLabel)
        MakeLeftEqualTo(_nameLabel.left);
        MakeTopEqualTo(_nameLabel.bottom).offset(7);
        MakeRighEqualTo(_textContainerView.right).offset(-10);
        MakeEnd


        _editButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [_editButton setImage:IMAGE(@"icon-rent-edit") forState:UIControlStateNormal];
        [_editButton setBackgroundColor:CUTE_MAIN_COLOR];
        _editButton.userInteractionEnabled = NO;//pass touch to tableview cell
        _editButton.frame= CGRectMake(RectWidthExclude(self.contentView.bounds, EDIT_BUTTON_WIDTH), IMAGE_VIEW_HEIGHT, EDIT_BUTTON_WIDTH, TEXT_VIEW_HEIGHT);
        [self.contentView addSubview:_editButton];
    }
    return self;
}


- (void)updateWithTicket:(CUTETicket *)ticket {
    if (IsArrayNilOrEmpty(ticket.property.realityImages)) {
        [_scrollImageView setImages:nil];
        [_scrollImageView setHidden:YES];
        [_placeholderView setHidden:NO];
    }
    else {
        [_scrollImageView setImages:ticket.property.realityImages];
        [_scrollImageView setHidden:NO];
        [_placeholderView setHidden:YES];
    }
    [_nameLabel setText:ticket.title];
    [_typeLabel setText:ticket.rentType.value];
}

@end
