//
//  BPLPagingView.m
//  BluePlate
//
//  Created by Foster Yin on 12/30/13.
//  Copyright (c) 2013 Brothers Bridge Technology. All rights reserved.
//

#import "BBTPagingView.h"
#import <BBTCommonMacro.h>
#import "NSObject+Attachment.h"


static NSString *kNameKey = @"nameKey";
static NSString *kImageKey = @"imageKey";

@interface BBTPagingView () <UIScrollViewDelegate>

@property (nonatomic, strong) UIScrollView *scrollView;
//@property (nonatomic, strong) UIPageControl *pageControl;
@property (nonatomic, strong) NSMutableArray *pageViews;

@property (nonatomic, strong) NSMutableArray *resuabelePageViews;

@property (nonatomic) NSInteger currentPage;
//@property (nonatomic, strong) NSMutableArray *viewControllers;
//@property (nonatomic, strong) NSArray *contentList;

@end

@implementation BBTPagingView

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self)
    {

        self.scrollView = [[UIScrollView alloc] initWithFrame:CGRectMake(0, 0, frame.size.width, frame.size.height)];
        self.scrollView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
//        self.scrollView.translatesAutoresizingMaskIntoConstraints = NO; //disable autlayout for scrollview
        // a page is the width of the scroll view
        self.scrollView.pagingEnabled = YES;

        self.scrollView.showsHorizontalScrollIndicator = NO;
        self.scrollView.showsVerticalScrollIndicator = NO;
        self.scrollView.scrollsToTop = NO;
        self.scrollView.delegate = self;

        [self addSubview:self.scrollView];

    }
    return self;
}

- (void)updateFrame:(CGRect)frame
{
    self.frame = frame;
    self.scrollView.frame = self.bounds;
    for (UIView *pageView in [self pageViews]) {
        if ([pageView isKindOfClass:[UIView class]])
        {
            pageView.frame = CGRectMake(pageView.frame.origin.x, pageView.frame.origin.y, frame.size.width, frame.size.height);
        }
    }
}

- (UIPanGestureRecognizer *)panGestureRecognizer {
    return self.scrollView.panGestureRecognizer;
}

- (void)reloadWithPageCount:(NSInteger)pageCount
{
    NSUInteger numberPages = pageCount;

    // view controllers are created lazily
    // in the meantime, load the array with placeholders which will be replaced on demand
    NSMutableArray *pageViews = [[NSMutableArray alloc] init];
    for (NSUInteger i = 0; i < numberPages; i++)
    {
        [pageViews addObject:[NSNull null]];
    }

    self.resuabelePageViews = [NSMutableArray array];
    self.pageViews = pageViews;
    [self.scrollView.subviews makeObjectsPerformSelector:@selector(removeFromSuperview)];
    self.scrollView.contentSize = CGSizeMake(CGRectGetWidth(self.scrollView.frame) * numberPages, CGRectGetHeight(self.scrollView.frame));
    self.currentPage = 0;

    // pages are created on demand
    // load the visible page
    // load the page on either side to avoid flashes when the user starts scrolling
    //

    [self markResuablePageViewsAvailableExclude:@[@(0), @(1)]];
    [self loadScrollViewWithPage:0];
    [self loadScrollViewWithPage:1];
}

- (void)loadScrollViewWithPage:(NSUInteger)page
{
    if (page >= self.pageViews.count)
        return;

    // replace the placeholder if necessary

    UIView *pageView = [[self pageViews] objectAtIndex:page];

    if ((NSNull *)pageView == [NSNull null])
    {
        pageView = [self.dateSource pageViewAtIndex:page];

        if ([self.resuabelePageViews containsObject:pageView]) {
            [self.resuabelePageViews removeObject:pageView];
            NSInteger pageOldIndex = [[self pageViews] indexOfObject:pageView];
            if (pageOldIndex != NSNotFound) {
                [pageView removeFromSuperview];
                [[self pageViews] replaceObjectAtIndex:pageOldIndex withObject:[NSNull null]];
            }
        }
        [[self pageViews] replaceObjectAtIndex:page withObject:pageView];
        [self.resuabelePageViews addObject:pageView];
    }

    // add the controller's view to the scroll view
    if (pageView.superview == nil)
    {
        [self.scrollView addSubview:pageView];
    }

    CGRect frame = self.scrollView.frame;
    frame.origin.x = CGRectGetWidth(frame) * page;
    frame.origin.y = 0;
    pageView.frame = frame;
}


- (void)markResuablePageViewsAvailableExclude:(NSArray *)excludeArray {
    NSUInteger count = self.pageViews.count;
    for (int i = 0; i < count; i++)
    {
        UIView *pageView = [self.pageViews objectAtIndex:i];
        if ([pageView isKindOfClass:[UIView class]] && ![excludeArray containsObject:[NSNumber numberWithUnsignedInteger:i]]) {
            pageView.attachment = nil;
        }
    }
}

- (id)dequeueReusablePageViewWithReuseIdentifier:(NSString *)identifier {
    for (UIView *pageView in self.resuabelePageViews) {
        if (pageView.attachment && [pageView.attachment isEqualToString:identifier]) {
            return pageView;
        }
    }
    for (UIView *pageView in self.resuabelePageViews) {
        if (!pageView.attachment) {
            return pageView;
        }
    }
    return nil;
}

- (void)scrollViewDidEndDragging:(UIScrollView *)scrollView willDecelerate:(BOOL)decelerate {
    CGFloat pageWidth = CGRectGetWidth(self.scrollView.frame);
    if (scrollView.contentOffset.x > pageWidth * (self.pageViews.count - 1)) {
        if (self.delegate != nil) {
            if ([self.delegate respondsToSelector:@selector(onPagingViewDragOver)]) {
                [self.delegate onPagingViewDragOver];
            }
        }
    }
}


// at the end of scroll animation, reset the boolean used when scrolls originate from the UIPageControl
- (void)scrollViewDidEndDecelerating:(UIScrollView *)scrollView
{
    // switch the indicator when more than 50% of the previous/next page is visible
    CGFloat pageWidth = CGRectGetWidth(self.scrollView.frame);
    NSUInteger page = floor((self.scrollView.contentOffset.x - pageWidth / 2) / pageWidth) + 1;
    self.currentPage = page;

    [self markResuablePageViewsAvailableExclude:@[@(page -1), @(page), @(page + 1)]];
    // load the visible page and the page on either side of it (to avoid flashes when the user starts scrolling)
    [self loadScrollViewWithPage:page - 1];
    [self loadScrollViewWithPage:page];
    [self loadScrollViewWithPage:page + 1];


    if (self.delegate != nil) {
        if ([self.delegate respondsToSelector:@selector(onPagingViewScrollToIndex:)]) {
            [self.delegate onPagingViewScrollToIndex:page];
        }
    }
    // a possible optimization would be to unload the views+controllers which are no longer visible
}

- (void)gotoPageAtIndex:(NSInteger)index animated:(BOOL)animated
{
    self.currentPage = index;

    NSInteger page = self.currentPage;

    [self markResuablePageViewsAvailableExclude:@[@(page -1), @(page), @(page + 1)]];
    // load the visible page and the page on either side of it (to avoid flashes when the user starts scrolling)
    [self loadScrollViewWithPage:page - 1];
    [self loadScrollViewWithPage:page];
    [self loadScrollViewWithPage:page + 1];

	// update the scroll view to the appropriate page
    CGRect bounds = self.scrollView.bounds;
    bounds.origin.x = CGRectGetWidth(bounds) * page;
    bounds.origin.y = 0;
    [self.scrollView scrollRectToVisible:bounds animated:animated];
}

- (void)reloadPageAtIndex:(NSInteger)index
{
    if (index >= self.pageViews.count)
        return;

    // replace the placeholder if necessary

    UIView *pageView = [[self pageViews] objectAtIndex:index];
    [[self pageViews] replaceObjectAtIndex:index withObject:[NSNull null]];
    [pageView removeFromSuperview];
    [self gotoPageAtIndex:index animated:NO];
}

- (void)setScrollEnabled:(BOOL)enable
{
    [self.scrollView setScrollEnabled:enable];
}



@end
