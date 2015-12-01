//
//  CUTEActivityView.m
//  currant
//
//  Created by Foster Yin on 7/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEActivityView.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import "MasonryMake.h"

#define ITEM_SPACE 35
#define ITEM_WIDTH 60
#define ITEM_HEIGHT 80
#define LINE_SPACING 35

#define TITLE_HEIGHT 30
#define BUTTON_HEIGHT 45

@interface CUTEActivityView () <UICollectionViewDataSource, UICollectionViewDelegate>
{
    UICollectionView *_collectionView;

    UIButton *_dismissButton;

    NSArray *_acitivities;

    UIView *_maskView;

    UILabel *_titleLabel;
}

@end


@implementation CUTEActivityView

- (CUTEActivityView *)initWithAcitities:(NSArray *)activities {
    self = [super initWithFrame:CGRectMake(0, 0, ScreenWidth, 195)];
    if (self) {
        _acitivities = activities;
        self.backgroundColor = [UIColor whiteColor];
        UICollectionViewFlowLayout *layout = [[UICollectionViewFlowLayout alloc] init];
        layout.itemSize = CGSizeMake(ITEM_WIDTH, ITEM_HEIGHT);
        layout.minimumInteritemSpacing = ITEM_SPACE;
        layout.minimumLineSpacing = LINE_SPACING;
        layout.headerReferenceSize = CGSizeMake(ScreenWidth, LINE_SPACING);
        layout.sectionInset = UIEdgeInsetsMake(0, ITEM_SPACE, 0, ITEM_SPACE);
        _collectionView = [[UICollectionView alloc] initWithFrame:CGRectMake(0, 0, RectWidth(self.bounds), (ITEM_HEIGHT + LINE_SPACING * 2)) collectionViewLayout:layout];
        _collectionView.dataSource = self;
        _collectionView.delegate = self;
        _collectionView.backgroundColor = [UIColor clearColor];
        [self addSubview:_collectionView];

        [_collectionView registerClass:[UICollectionViewCell class] forCellWithReuseIdentifier:@"ShareItemCell"];

        _dismissButton = [UIButton buttonWithType:UIButtonTypeCustom];
        [_dismissButton setTitle:STR(@"Activity/取消分享") forState:UIControlStateNormal];
        [_dismissButton setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
        [_dismissButton setBackgroundColor:CUTE_MAIN_COLOR];
        [self addSubview:_dismissButton];
        [_dismissButton addTarget:self action:@selector(onDismissButtonPressed:) forControlEvents:UIControlEventTouchUpInside];

        _maskView = [[UIView alloc] init];
        _maskView.backgroundColor = HEXCOLOR(0x000000, 0.6);
    }
    return self;
}

- (void)setActivityTitle:(NSString *)activityTitle {
    _activityTitle = activityTitle;

    if (!_titleLabel) {
        _titleLabel = [UILabel new];
        _titleLabel.numberOfLines = 1;
        _titleLabel.font = [UIFont systemFontOfSize:12];
        _titleLabel.textColor = HEXCOLOR(0x999999, 1);
        _titleLabel.textAlignment = NSTextAlignmentCenter;
        [self addSubview:_titleLabel];
    }

    _titleLabel.text = activityTitle;
}

- (void)onDismissButtonPressed:(id)button {
    [self dismiss:YES];

    if (self.onDismissButtonPressedBlock) {
        self.onDismissButtonPressedBlock();
    }
}

- (void)show:(BOOL)animated {
    NSInteger lineCount = (int)ceil(_acitivities.count / 3.0);
    CGFloat collectionViewHeight = lineCount * (ITEM_HEIGHT + LINE_SPACING) + LINE_SPACING;

    if (_titleLabel) {
        CGFloat titleHeight = TITLE_HEIGHT;
        self.frame = CGRectMake(0, ScreenHeight, ScreenWidth, collectionViewHeight + BUTTON_HEIGHT + titleHeight);
        _titleLabel.frame = CGRectMake(0, 0, RectWidth(self.bounds), titleHeight);
        _collectionView.frame = CGRectMake(0, titleHeight, RectWidth(self.bounds), collectionViewHeight);
        _dismissButton.frame = CGRectMake(0, titleHeight + collectionViewHeight, RectWidth(self.bounds), BUTTON_HEIGHT);
    }
    else {
        self.frame = CGRectMake(0, ScreenHeight, ScreenWidth, collectionViewHeight + BUTTON_HEIGHT);
        _collectionView.frame = CGRectMake(0, 0, RectWidth(self.bounds), collectionViewHeight);
        _dismissButton.frame = CGRectMake(0, collectionViewHeight, RectWidth(self.bounds), BUTTON_HEIGHT);
    }

    _maskView.frame = CGRectMake(0, 0, ScreenWidth, ScreenHeight);
    _maskView.alpha = 0;
    [[[UIApplication sharedApplication] keyWindow] addSubview:_maskView];
    [[[UIApplication sharedApplication] keyWindow] addSubview:self];

    [_collectionView reloadData];
    
    [UIView animateWithDuration:0.3 animations:^{
        _maskView.alpha = 1;
        self.frame = CGRectMake(0, ScreenHeight - self.frame.size.height, RectWidth(self.bounds), self.frame.size.height);
    }];
}

- (void)dismiss:(BOOL)animated {

    [UIView animateWithDuration:0.3 animations:^{
        self.frame = CGRectMake(0, ScreenHeight, RectWidth(self.bounds), self.bounds.size.height);
        _maskView.alpha = 0;
    } completion:^(BOOL finished) {
        [self removeFromSuperview];
        [_maskView removeFromSuperview];
    }];

}

#pragma - mark UICollectionViewDelegate and UICollectionViewDataSource

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
    return [_acitivities count];
}

// The cell that is returned must be retrieved from a call to -dequeueReusableCellWithReuseIdentifier:forIndexPath:
- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
    UICollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:@"ShareItemCell" forIndexPath:indexPath];
    if (!cell) {
        cell = [[UICollectionViewCell alloc] init];
    }
    CUTEActivity *acitity = [_acitivities objectAtIndex:indexPath.item];
    UIImageView *icon = [[UIImageView alloc] initWithImage:acitity.activityImage];
    [cell.contentView addSubview:icon];
    UILabel *label = [UILabel new];
    label.text = acitity.activityTitle;
    label.textColor = HEXCOLOR(0x999999, 1);
    label.font = [UIFont systemFontOfSize:12];
    label.textAlignment = NSTextAlignmentCenter;
    [cell.contentView addSubview:label];

    MakeBegin(icon)
    MakeTopEqualTo(cell.contentView.top);
    MakeRighEqualTo(cell.contentView.right);
    MakeLeftEqualTo(cell.contentView.left);
    MakeEnd

    MakeBegin(label)
    MakeBottomEqualTo(cell.contentView.bottom);
    MakeLeftEqualTo(cell.contentView.left);
    MakeRighEqualTo(cell.contentView.right);
    MakeHeightEqualTo(@(20));
    MakeEnd

    return cell;
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath {
    CUTEActivity *activity = [_acitivities objectAtIndex:indexPath.item];
    if (activity.performActivityBlock) {
        activity.performActivityBlock();
    }
    [self dismiss:YES];
}

@end
